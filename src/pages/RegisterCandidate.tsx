import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, User, Flag, Image, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BallotLoader from '@/components/BallotLoader';

const RegisterCandidate: React.FC = () => {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation
    if (!name.trim() || !party.trim() || !manifesto.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (name.length > 100) {
      toast({
        title: 'Validation Error',
        description: 'Name must be less than 100 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (manifesto.length > 1000) {
      toast({
        title: 'Validation Error',
        description: 'Manifesto must be less than 1000 characters.',
        variant: 'destructive',
      });
      return;
    }

    // Validate photo URL if provided
    if (photoUrl.trim()) {
      try {
        new URL(photoUrl);
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid photo URL.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      await api.post('/candidates', {
        name: name.trim(),
        party: party.trim(),
        photoUrl: photoUrl.trim() || undefined,
        manifesto: manifesto.trim(),
      });
      
      setIsSuccess(true);
      
      toast({
        title: 'Candidate Registered!',
        description: 'The candidate has been successfully added.',
      });
      
      setTimeout(() => {
        navigate('/candidates');
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <BallotLoader text="Registering candidate..." size="lg" />
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-fade-in">
            <div className="mx-auto w-20 h-20 rounded-full gradient-success flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-success-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Candidate Registered!
            </h2>
            <p className="text-muted-foreground">
              Redirecting to candidates list...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="font-display text-2xl">Register Candidate</CardTitle>
              <CardDescription>
                Add a new candidate to the election
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Candidate Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full name of candidate"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="party">Political Party *</Label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="party"
                      type="text"
                      placeholder="Party affiliation"
                      value={party}
                      onChange={(e) => setParty(e.target.value)}
                      className="pl-10"
                      maxLength={50}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="photoUrl"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manifesto">Manifesto *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="manifesto"
                      placeholder="Describe the candidate's platform, goals, and vision..."
                      value={manifesto}
                      onChange={(e) => setManifesto(e.target.value)}
                      className="pl-10 min-h-[120px] resize-none"
                      maxLength={1000}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {manifesto.length}/1000 characters
                  </p>
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full gradient-success gap-2">
                  Register Candidate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterCandidate;
