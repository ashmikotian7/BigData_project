import React, { useState } from 'react';
import { CheckCircle, Vote, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Candidate {
  _id: string;
  name: string;
  party: string;
  photoUrl?: string;
  manifesto: string;
  votes: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (candidateId: string) => Promise<void>;
  hasVoted: boolean;
  isAuthenticated: boolean;
  votingEnded?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onVote,
  hasVoted,
  isAuthenticated,
  votingEnded = false,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVote = async () => {
    if (hasVoted || !isAuthenticated || votingEnded) return;
    
    setIsVoting(true);
    try {
      await onVote(candidate._id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      // Error handled in parent
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-2 bg-card border-border card-3d animate-fade-in">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${candidate.photoUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-indigo-500/10`}>
          <User className="w-24 h-24 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        {/* Party Badge */}
        <Badge 
          className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-lg animate-float"
        >
          {candidate.party}
        </Badge>

        {/* Vote Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <Vote className="w-4 h-4 text-purple-500 animate-pulse" />
          <span className="font-semibold text-foreground">{candidate.votes}</span>
          <span className="text-sm text-muted-foreground">votes</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-display font-bold text-xl text-foreground group-hover:text-purple-600 transition-colors duration-300">
          {candidate.name}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm line-clamp-3 group-hover:text-foreground transition-colors duration-300">
          {candidate.manifesto}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        {!isAuthenticated ? (
          <Button variant="outline" className="w-full neumorphic" disabled>
            Login to Vote
          </Button>
        ) : votingEnded ? (
          <Button 
            variant="outline" 
            className="w-full gap-2 text-muted-foreground border-muted cursor-default neumorphic"
            disabled
          >
            <Clock className="w-4 h-4" />
            Voting Ended
          </Button>
        ) : hasVoted ? (
          <Button 
            variant="outline" 
            className="w-full gap-2 text-green-600 border-green-600/30 bg-green-600/5 cursor-default neumorphic"
            disabled
          >
            <CheckCircle className="w-4 h-4" />
            Vote Recorded
          </Button>
        ) : (
          <Button
            onClick={handleVote}
            disabled={isVoting}
            className={`w-full gap-2 transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 text-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/50 neumorphic font-bold text-lg py-6 border-2 border-purple-300 hover:border-purple-500 ${
              showSuccess 
                ? 'animate-pulse-ring' 
                : ''
            }`}
          >
            {isVoting ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-purple-600 group-hover:text-white">Voting...</span>
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-purple-600 group-hover:text-white animate-check-bounce" />
                <span className="text-purple-600 group-hover:text-white">Voted!</span>
              </>
            ) : (
              <>
                <Vote className="w-4 h-4 text-purple-600 group-hover:text-white" />
                <span className="text-purple-600 group-hover:text-white">Cast Vote</span>
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;