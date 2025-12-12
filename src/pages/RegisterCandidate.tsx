import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, User, Flag, Image, FileText, ArrowRight, CheckCircle, Search, Plus, Calendar, Layers, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BallotLoader from '@/components/BallotLoader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

const RegisterCandidate: React.FC = () => {
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Group and position states
  const [groups, setGroups] = useState<Group[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');
  const [voteEndTime, setVoteEndTime] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreatePosition, setShowCreatePosition] = useState(false);
  const [openGroupSelect, setOpenGroupSelect] = useState(false);
  const [openPositionSelect, setOpenPositionSelect] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get('/groups');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    
    fetchGroups();
  }, []);

  // Fetch positions when group is selected
  useEffect(() => {
    const fetchPositions = async () => {
      if (selectedGroup) {
        try {
          const response = await api.get(`/positions/group/${selectedGroup}`);
          setPositions(response.data);
          // Reset position selection when group changes
          setSelectedPosition('');
        } catch (error) {
          console.error('Error fetching positions:', error);
        }
      } else {
        setPositions([]);
        setSelectedPosition('');
      }
    };
    
    fetchPositions();
  }, [selectedGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Group name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await api.post('/groups', {
        name: newGroupName.trim(),
        description: newGroupDescription.trim()
      });
      
      setGroups([...groups, response.data]);
      setSelectedGroup(response.data._id);
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      toast({
        title: 'Group Created',
        description: 'New group has been created successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create group.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Group name is required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await api.post('/groups/join', {
        name: newGroupName.trim()
      });
      
      // Check if group already exists in our list
      const groupExists = groups.some(g => g._id === response.data._id);
      
      if (!groupExists) {
        setGroups([...groups, response.data]);
      }
      
      setSelectedGroup(response.data._id);
      setShowCreateGroup(false);
      setNewGroupName('');
      
      toast({
        title: 'Joined Group',
        description: 'Successfully joined the group.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to join group.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleCreatePosition = async () => {
    if (!newPositionName.trim() || !voteEndTime) {
      toast({
        title: 'Validation Error',
        description: 'Position name and vote end time are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await api.post('/positions', {
        name: newPositionName.trim(),
        description: newPositionDescription.trim(),
        groupId: selectedGroup,
        voteEndTime
      });
      
      setPositions([...positions, response.data]);
      setSelectedPosition(response.data._id);
      setShowCreatePosition(false);
      setNewPositionName('');
      setNewPositionDescription('');
      setVoteEndTime('');
      
      toast({
        title: 'Position Created',
        description: 'New position has been created successfully.',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create position.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation
    if (!name.trim() || !party.trim() || !manifesto.trim() || !selectedGroup || !selectedPosition) {
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
        groupId: selectedGroup,
        positionId: selectedPosition
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
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30 animate-pulse-ring">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Candidate Registered!
            </h2>
            <p className="text-muted-foreground text-lg">
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-border shadow-xl neumorphic animate-fade-in">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 animate-float">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="font-display text-3xl">Register Candidate</CardTitle>
              <CardDescription className="text-lg">
                Add a new candidate to the election
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-purple-200">
                    <User className="w-5 h-5 text-purple-600" />
                    <h3 className="font-display font-bold text-xl text-foreground">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="pl-10 neumorphic"
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
                          className="pl-10 neumorphic"
                          maxLength={50}
                          required
                        />
                      </div>
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
                        className="pl-10 neumorphic"
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
                        className="pl-10 min-h-[140px] resize-none neumorphic"
                        maxLength={1000}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {manifesto.length}/1000 characters
                    </p>
                  </div>
                </div>

                {/* Group & Position Selection */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-purple-200">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <h3 className="font-display font-bold text-xl text-foreground">Group & Position</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Group *</Label>
                      <div className="flex gap-2">
                        <Popover open={openGroupSelect} onOpenChange={setOpenGroupSelect}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openGroupSelect}
                              className="w-full justify-between neumorphic"
                            >
                              {selectedGroup
                                ? groups.find((group) => group._id === selectedGroup)?.name
                                : "Select group..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 neumorphic">
                            <Command>
                              <CommandInput placeholder="Search group..." />
                              <CommandList>
                                <CommandEmpty>No group found.</CommandEmpty>
                                <CommandGroup>
                                  {groups.map((group) => (
                                    <CommandItem
                                      key={group._id}
                                      value={group.name}
                                      onSelect={() => {
                                        setSelectedGroup(group._id);
                                        setOpenGroupSelect(false);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <span>{group.name}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateGroup(true)}
                          className="neumorphic"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Position Selection */}
                    <div className="space-y-2">
                      <Label>Position *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedPosition} onValueChange={setSelectedPosition} disabled={!selectedGroup}>
                          <SelectTrigger className="w-full neumorphic">
                            <SelectValue placeholder="Select position..." />
                          </SelectTrigger>
                          <SelectContent className="neumorphic">
                            {positions.map((position) => (
                              <SelectItem key={position._id} value={position._id}>
                                {position.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreatePosition(true)}
                          disabled={!selectedGroup}
                          className="neumorphic"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Create/Join Group Dialog */}
                  {showCreateGroup && (
                    <Card className="border-dashed neumorphic">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Layers className="w-5 h-5 text-purple-600" />
                          {groups.some(g => g.name.toLowerCase() === newGroupName.toLowerCase())
                            ? "Join Existing Group" 
                            : "Create New Group"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newGroupName">Group Name *</Label>
                          <Input
                            id="newGroupName"
                            placeholder="Enter group name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="neumorphic"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newGroupDescription">Description (Optional)</Label>
                          <Textarea
                            id="newGroupDescription"
                            placeholder="Describe the group..."
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            className="resize-none neumorphic"
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateGroup(false)}
                            className="neumorphic"
                          >
                            Cancel
                          </Button>
                          
                          {groups.some(g => g.name.toLowerCase() === newGroupName.toLowerCase()) ? (
                            <Button type="button" onClick={handleJoinGroup} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                              Join Group
                            </Button>
                          ) : (
                            <Button type="button" onClick={handleCreateGroup} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                              Create Group
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Create Position Dialog */}
                  {showCreatePosition && (
                    <Card className="border-dashed neumorphic">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          Create New Position
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPositionName">Position Name *</Label>
                          <Input
                            id="newPositionName"
                            placeholder="Enter position name"
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            className="neumorphic"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPositionDescription">Description (Optional)</Label>
                          <Textarea
                            id="newPositionDescription"
                            placeholder="Describe the position..."
                            value={newPositionDescription}
                            onChange={(e) => setNewPositionDescription(e.target.value)}
                            className="resize-none neumorphic"
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="voteEndTime">Voting End Time *</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="voteEndTime"
                              type="datetime-local"
                              value={voteEndTime}
                              onChange={(e) => setVoteEndTime(e.target.value)}
                              className="pl-10 neumorphic"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreatePosition(false)}
                            className="neumorphic"
                          >
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleCreatePosition} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                            Create Position
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2 text-lg py-6 neumorphic hover:shadow-lg hover:shadow-purple-500/30"
                  disabled={!selectedGroup || !selectedPosition}
                >
                  Register Candidate
                  <ArrowRight className="w-5 h-5" />
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