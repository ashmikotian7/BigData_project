import React from 'react';

interface BallotLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BallotLoader: React.FC<BallotLoaderProps> = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: { box: 'w-16 h-20', ballot: 'w-10 h-6', text: 'text-sm' },
    md: { box: 'w-24 h-28', ballot: 'w-14 h-8', text: 'text-base' },
    lg: { box: 'w-32 h-36', ballot: 'w-20 h-10', text: 'text-lg' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Pulse ring behind the box */}
      <div className="relative">
        <div className={`absolute inset-0 rounded-xl bg-primary/20 animate-pulse-ring ${classes.box}`} />
        
        {/* Ballot Box */}
        <div className={`relative ${classes.box} animate-box-shake`}>
          {/* Box body */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-b from-primary to-primary/80 rounded-lg shadow-lg">
            {/* Box slot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-foreground/90 rounded-sm" />
            
            {/* Box front design */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full border-2 border-primary-foreground/50 flex items-center justify-center">
                <svg 
                  className="w-4 h-4 text-primary-foreground" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Falling Ballots */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 overflow-hidden h-full w-full">
            {/* Ballot 1 */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 ${classes.ballot} bg-card border-2 border-border rounded shadow-md animate-ballot-drop stagger-1`}
            >
              <div className="w-full h-full p-1 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-muted rounded w-3/4" />
                <div className="h-1 bg-primary/30 rounded w-1/2" />
              </div>
            </div>
            
            {/* Ballot 2 */}
            <div 
              className={`absolute left-1/3 -translate-x-1/2 ${classes.ballot} bg-card border-2 border-border rounded shadow-md animate-ballot-drop stagger-2`}
              style={{ width: 'calc(100% * 0.45)' }}
            >
              <div className="w-full h-full p-1 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-muted rounded w-2/3" />
                <div className="h-1 bg-secondary/30 rounded w-1/2" />
              </div>
            </div>
            
            {/* Ballot 3 */}
            <div 
              className={`absolute left-2/3 -translate-x-1/2 ${classes.ballot} bg-card border-2 border-border rounded shadow-md animate-ballot-drop stagger-3`}
              style={{ width: 'calc(100% * 0.4)' }}
            >
              <div className="w-full h-full p-1 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-muted rounded w-4/5" />
                <div className="h-1 bg-accent/30 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading text */}
      <p className={`${classes.text} font-medium text-muted-foreground animate-pulse`}>
        {text}
      </p>
    </div>
  );
};

export default BallotLoader;
