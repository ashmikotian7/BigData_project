import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import CandidateCard from '@/components/CandidateCard';
import BallotLoader from '@/components/BallotLoader';
import { Users, RefreshCw, AlertCircle, Trophy, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';

interface Group {
  _id: string;
  name: string;
  description: string;
}

interface Position {
  _id: string;
  name: string;
  description: string;
  voteEndTime: string;
}

interface Candidate {
  _id: string;
  name: string;
  party: string;
  photoUrl?: string;
  manifesto: string;
  votes: number;
  groupId: string;
  positionId: string;
}

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Get voted positions for the current user
  const [votedPositions, setVotedPositions] = useState<Set<string>>(new Set());

  const fetchVotedPositions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/votes/my-positions');
      setVotedPositions(new Set(response.data.votedPositions));
    } catch (err) {
      console.error('Error fetching voted positions:', err);
    }
  }, [isAuthenticated]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.get('/groups');
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    if (selectedGroup) {
      try {
        const response = await api.get(`/positions/group/${selectedGroup}`);
        setPositions(response.data);
        // Reset position selection when group changes
        setSelectedPosition('');
      } catch (err) {
        console.error('Error fetching positions:', err);
      }
    } else {
      setPositions([]);
      setSelectedPosition('');
    }
  }, [selectedGroup]);

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = '/candidates';
      if (selectedPosition) {
        url = `/candidates/position/${selectedPosition}`;
      } else if (selectedGroup) {
        // We need to fetch all positions for the group first, then all candidates for those positions
        const positionsResponse = await api.get(`/positions/group/${selectedGroup}`);
        const positionIds = positionsResponse.data.map((p: Position) => p._id);
        
        if (positionIds.length > 0) {
          // For simplicity, we'll fetch candidates for the first position
          // In a real app, you might want to fetch all candidates for all positions
          url = `/candidates/position/${positionIds[0]}`;
        }
      }
      
      const response = await api.get(url);
      setCandidates(response.data);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load candidates.';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroup, selectedPosition, toast]);

  useEffect(() => {
    Promise.all([
      fetchGroups(),
      fetchVotedPositions()
    ]);
  }, [fetchGroups, fetchVotedPositions]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleVote = async (candidateId: string, positionId: string) => {
    try {
      await api.post('/votes', { candidateId });
      
      // Update local state to reflect the vote
      setCandidates((prev) =>
        prev.map((c) =>
          c._id === candidateId ? { ...c, votes: c.votes + 1 } : c
        )
      );
      
      // Add position to voted positions
      setVotedPositions(prev => new Set(prev).add(positionId));
      
      toast({
        title: 'Vote Cast Successfully!',
        description: 'Your vote has been recorded. Thank you for participating!',
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to cast vote.';
      toast({
        title: 'Voting Failed',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Check if voting has ended for a position
  const isVotingEnded = (voteEndTime: string) => {
    return new Date() > new Date(voteEndTime);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white mb-6 animate-float">
            <Users className="w-5 h-5" />
            <span className="text-lg font-medium">Election Candidates</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Cast Your Vote
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Review the candidates and cast your vote. You can vote once per position.
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="neumorphic">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 pb-4">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="font-display font-bold text-lg text-foreground">Filter Candidates</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Group</label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="neumorphic">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent className="neumorphic">
                      {groups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedGroup && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger className="neumorphic">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent className="neumorphic">
                        {positions.map((position) => (
                          <SelectItem key={position._id} value={position._id}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={fetchCandidates}
                  disabled={isLoading}
                  className="gap-2 neumorphic border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <BallotLoader text="Loading candidates..." size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Failed to Load Candidates
            </h3>
            <p className="text-muted-foreground text-lg">{error}</p>
            <Button onClick={fetchCandidates} variant="outline" className="gap-2 neumorphic border-purple-300 text-purple-600 hover:bg-purple-50">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              No Candidates Found
            </h3>
            <p className="text-muted-foreground text-lg max-w-md text-center">
              {selectedPosition 
                ? "No candidates registered for this position yet." 
                : "No candidates found. Try selecting a different group or position."}
            </p>
            
            {isAuthenticated && (
              <Link to="/register-candidate">
                <Button variant="default" className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white neumorphic">
                  Register as Candidate
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Candidates Grid */}
        {!isLoading && !error && candidates.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {candidates
              .filter(candidate => {
                // Filter by selected position if one is selected
                if (selectedPosition) {
                  return candidate.positionId === selectedPosition;
                }
                // Filter by selected group if one is selected
                if (selectedGroup) {
                  return candidate.groupId === selectedGroup;
                }
                return true;
              })
              .map((candidate, index) => {
                // Find the position for this candidate to check if voting ended
                const position = positions.find(p => p._id === candidate.positionId);
                const votingEnded = position ? isVotingEnded(position.voteEndTime) : false;
                const hasVoted = votedPositions.has(candidate.positionId);
                
                return (
                  <div
                    key={candidate._id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <CandidateCard
                      candidate={candidate}
                      onVote={() => handleVote(candidate._id, candidate.positionId)}
                      hasVoted={hasVoted}
                      isAuthenticated={isAuthenticated}
                      votingEnded={votingEnded}
                    />
                  </div>
                );
              })}
          </div>
        )}

        {/* View Results Button */}
        {selectedPosition && (
          <div className="mt-16 text-center">
            <Link to={`/results/${selectedPosition}`}>
              <Button variant="outline" size="lg" className="gap-2 neumorphic px-8 py-6 text-lg border-purple-300 text-purple-600 hover:bg-purple-50">
                <Trophy className="w-5 h-5" />
                View Results for This Position
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;