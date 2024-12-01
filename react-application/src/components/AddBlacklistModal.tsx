import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { blacklist } from "@/types";

interface AddBlacklistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: blacklist[]) => void;
}

export const AddBlacklistModal = ({
  open,
  onClose,
  onSuccess,
}: AddBlacklistModalProps) => {
  const [reason, setReason] = useState<string>("");
  const [ip, setIp] = useState<string>("");

  const handleSubmit = () => {
    fetch("api/blacklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ip,
        reason,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setReason("");
        setIp("");
        onSuccess(data.blacklist);
      });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to blacklist</DialogTitle>
          <DialogDescription>
            Add an IP address to the blacklist. This will prevent the IP from
            accessing the API and website application.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="IP"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <Input
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button onClick={handleSubmit}>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
};
