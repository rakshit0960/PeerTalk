import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import { MessageCircle, Users, Search, Video, X } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    title: "Welcome to PeerTalk! 👋",
    description: "Let's take a quick tour of the features.",
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
  },
  {
    title: "Find Friends",
    description: "Use the search button in the top right to find and connect with other users.",
    icon: <Search className="h-6 w-6 text-primary" />,
  },
  {
    title: "Start Conversations",
    description: "Click on a user to start chatting with them instantly.",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "Video Calls",
    description: "Start video calls directly from your chat conversations.",
    icon: <Video className="h-6 w-6 text-primary" />,
  },
];

export function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const setTutorialComplete = useStore(state => state.setTutorialComplete);

  const handleComplete = () => {
    setIsVisible(false);
    setTutorialComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleComplete}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            {steps[currentStep].icon}
          </div>
        </div>

        <h2 className="mb-2 text-center text-lg font-semibold">
          {steps[currentStep].title}
        </h2>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          {steps[currentStep].description}
        </p>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-primary/20"
                  }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
