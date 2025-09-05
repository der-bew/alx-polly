"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Share2, Twitter, Facebook, Mail } from "lucide-react";
import { toast } from "sonner";

interface SharePollProps {
  pollId: string;
  pollTitle: string;
}

/**
 * Renders a component for sharing a poll.
 *
 * This component generates a shareable URL for the poll and provides buttons
 * to copy the link or share it on social media platforms.
 *
 * @param {SharePollProps} props - The component props.
 * @param {string} props.pollId - The ID of the poll to be shared.
 * @param {string} props.pollTitle - The title of the poll.
 * @returns {JSX.Element} The rendered share poll component.
 */
export default function SharePoll({ pollId, pollTitle }: SharePollProps) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Generate the full shareable URL on the client-side.
    // WHY: This ensures the URL is correct based on the user's current domain.
    const baseUrl = window.location.origin;
    const pollUrl = `${baseUrl}/polls/${pollId}`;
    setShareUrl(pollUrl);
  }, [pollId]);

  /**
   * Copies the shareable URL to the user's clipboard.
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  /**
   * Opens a new window to share the poll on Twitter.
   */
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this poll: ${pollTitle}`);
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
  };

  /**
   * Opens a new window to share the poll on Facebook.
   */
  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
    );
  };

  /**
   * Opens the user's default email client to share the poll.
   */
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Poll: ${pollTitle}`);
    const body = encodeURIComponent(
      `Hi! I'd like to share this poll with you: ${shareUrl}`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share This Poll
        </CardTitle>
        <CardDescription>
          Share your poll with others to gather votes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Shareable Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
              placeholder="Generating link..."
            />
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Share on social media
          </label>
          <div className="flex space-x-2">
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              onClick={shareOnFacebook}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              onClick={shareViaEmail}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
