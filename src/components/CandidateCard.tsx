import React, { useState } from 'react';
import { CheckCircle, Vote, User } from 'lucide-react';
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
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onVote,
  hasVoted,
  isAuthenticated,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVote = async () => {
    if (hasVoted || !isAuthenticated) return;
    
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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card border-border">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {candidate.photoUrl ? (
          <img
            src={candidate.photoUrl}
            alt={candidate.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`${candidate.photoUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10`}>
          <User className="w-20 h-20 text-muted-foreground/50" />
        </div>
        
        {/* Party Badge */}
        <Badge 
          className="absolute top-3 right-3 bg-primary/90 text-primary-foreground border-0"
        >
          {candidate.party}
        </Badge>

        {/* Vote Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Vote className="w-4 h-4 text-secondary" />
          <span className="font-semibold text-foreground">{candidate.votes}</span>
          <span className="text-sm text-muted-foreground">votes</span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-display font-bold text-xl text-foreground">
          {candidate.name}
        </h3>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {candidate.manifesto}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        {!isAuthenticated ? (
          <Button variant="outline" className="w-full" disabled>
            Login to Vote
          </Button>
        ) : hasVoted ? (
          <Button 
            variant="outline" 
            className="w-full gap-2 text-success border-success/30 bg-success/5 cursor-default"
            disabled
          >
            <CheckCircle className="w-4 h-4" />
            Vote Recorded
          </Button>
        ) : (
          <Button
            onClick={handleVote}
            disabled={isVoting}
            className={`w-full gap-2 transition-all ${
              showSuccess 
                ? 'bg-success hover:bg-success' 
                : 'gradient-primary hover:opacity-90'
            }`}
          >
            {isVoting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Voting...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 animate-check-bounce" />
                Voted!
              </>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                Cast Vote
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
