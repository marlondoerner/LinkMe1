import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  profile_number: string;
  bio: string | null;
  profile_picture_url: string | null;
  qr_code_url: string | null;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface Comment {
  id: string;
  commenter_number: string;
  content: string;
  created_at: string;
}

interface ProfileModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ profile, isOpen, onClose }: ProfileModalProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenterNumber, setCommenterNumber] = useState("");
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (profile) {
      loadSocialLinks();
      loadComments();
    }
  }, [profile]);

  const loadSocialLinks = async () => {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("profile_id", profile.id);

    if (data && !error) {
      setSocialLinks(data);
    }
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setComments(data);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commenterNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (commenterNumber.length !== 4) {
      toast.error("Please enter a valid 4-digit number");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      profile_id: profile.id,
      commenter_number: commenterNumber,
      content: newComment,
    });

    if (error) {
      toast.error("Failed to add comment");
    } else {
      toast.success("Comment added!");
      setNewComment("");
      setCommenterNumber("");
      loadComments();
    }
  };

  const profileUrl = `${window.location.origin}/app?profile=${profile.profile_number}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold neon-text">
            Profile #{profile.profile_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary glow-border">
              <AvatarImage src={profile.profile_picture_url || ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                {profile.profile_number}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{profile.bio || "No bio yet"}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="border-primary/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {showQR ? "Hide" : "Show"} QR Code
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="glass-card p-6 rounded-xl flex flex-col items-center">
              <QRCodeSVG value={profileUrl} size={200} className="mb-4" />
              <p className="text-sm text-muted-foreground text-center">{profileUrl}</p>
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                Social Links
              </h4>
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 transition-colors"
                  >
                    <Badge variant="outline" className="border-primary/30">
                      {link.platform}
                    </Badge>
                    <span className="text-sm text-muted-foreground truncate">{link.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="glass-card p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Comments
            </h4>

            {/* Add Comment */}
            <div className="mb-4 space-y-2">
              <Input
                placeholder="Your 4-digit number"
                value={commenterNumber}
                onChange={(e) => setCommenterNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className="glass-card border-primary/30"
              />
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="glass-card border-primary/30"
              />
              <Button
                onClick={handleAddComment}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Post Comment
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="glass-card p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="border-primary/30">
                        #{comment.commenter_number}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
