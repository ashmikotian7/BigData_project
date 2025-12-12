import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/axios';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import BallotLoader from '@/components/BallotLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, Award, TrendingUp, Medal } from 'lucide-react';

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
  percentage: number;
}

interface ResultsData {
  position: Position;
  candidates: Candidate[];
  winners: Candidate[];
  totalVotes: number;
  votingEnded: boolean;
}

const Results: React.FC = () => {
  const { positionId } = useParams<{ positionId: string }>();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get(`/votes/public-results/${positionId}`);
        setResults(response.data);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to load results.';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (positionId) {
      fetchResults();
    }
  }, [positionId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <BallotLoader text="Loading results..." size="lg" />
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-destructive neumorphic">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Award className="w-5 h-5" />
                  Error Loading Results
                </CardTitle>
                <CardDescription>
                  {error || 'Unable to load voting results at this time.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please try again later or contact support if the problem persists.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { position, candidates, winners, totalVotes, votingEnded } = results;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg animate-float bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Trophy className="w-5 h-5 mr-2" />
            Election Results
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 animate-tilt">
            {position.name}
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            {position.description || 'Official results for this position'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="text-center neumorphic animate-fade-in stagger-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Voting Ended</h3>
              <p className="text-muted-foreground">
                {new Date(position.voteEndTime).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center neumorphic animate-fade-in stagger-2">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Total Votes</h3>
              <p className="text-2xl font-bold text-foreground">{totalVotes}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center neumorphic animate-fade-in stagger-3">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Candidates</h3>
              <p className="text-2xl font-bold text-foreground">{candidates.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Winners Section */}
        {winners.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
              {winners.length > 1 ? 'Winners' : 'Winner'}
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {winners.map((winner, index) => (
                <Card 
                  key={winner._id} 
                  className="border border-purple-500 neumorphic card-3d overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <CardHeader className="relative">
                    <div className="absolute -top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Trophy className="w-6 h-6 text-purple-500" />
                      {winner.name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {winner.party}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {winner.manifesto}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="default" className="text-lg px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                        {winner.votes} votes
                      </Badge>
                      <Badge variant="secondary" className="text-lg px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                        {winner.percentage}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Candidates */}
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
            All Candidates
          </h2>
          
          <div className="space-y-6">
            {candidates.map((candidate, index) => (
              <Card 
                key={candidate._id} 
                className="neumorphic card-3d animate-fade-in"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-display font-bold text-2xl text-foreground mb-1">
                            {candidate.name}
                          </h3>
                          <p className="text-muted-foreground text-lg">
                            {candidate.party}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default" className="text-lg px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                            {candidate.votes} votes
                          </Badge>
                          <Badge variant="secondary" className="text-lg px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                            {candidate.percentage}%
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {candidate.manifesto}
                      </p>
                    </div>
                    
                    <div className="w-full lg:w-64">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">{candidate.percentage}%</span>
                      </div>
                      <div className="w-full bg-purple-200/20 rounded-full h-4 neumorphic-inset">
                        <div 
                          className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${candidate.percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-sm text-muted-foreground">
                          {candidate.votes} of {totalVotes} votes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;