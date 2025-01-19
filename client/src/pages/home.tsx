import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useStore } from '@/store/store'
import { motion } from 'framer-motion'
import { Ghost, LogIn, MessageCircle, Shield, UserPlus, Users, Video, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = useStore(state => state.isLoggedIn);

  const handleGuestLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create guest account');
      }
      const token = data.token;
      console.log("Login successful, token:", token);

      localStorage.setItem("token", token);
      useStore.getState().setIsInitialized(false);
      useStore.getState().initialize();
      navigate("/chat");



    } catch (error) {
      console.error('Guest login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create guest account",
      });
    }
  };

  return (
    <div>
      <div className="relative container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center space-y-12"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center ring-1 ring-primary/20"
            >
              <MessageCircle className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Connect Instantly
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience real-time messaging with a modern touch.
              No sign-up required to try it out.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isLoggedIn ? (
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
                onClick={() => navigate('/chat')}
              >
                <MessageCircle className="w-4 h-4" />
                Continue to Chat
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>

                <Link to="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-primary/20 hover:bg-primary/10">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Button>
                </Link>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleGuestLogin}
                  className="w-full sm:w-auto gap-2 bg-secondary/10 hover:bg-secondary/20"
                >
                  <Ghost className="w-4 h-4" />
                  Try as Guest
                </Button>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index + 0.8 }}
                className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5 group"
              >
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const features = [
  {
    title: "Real-time Messaging",
    description: "Experience instant messaging with live typing indicators and read receipts.",
    icon: Zap,
  },
  {
    title: "Video Calls",
    description: "Start high-quality video calls with your contacts in one click.",
    icon: Video,
  },
  {
    title: "Find Friends",
    description: "Connect with friends and make new connections easily.",
    icon: Users,
  },
  {
    title: "Guest Access",
    description: "Try instantly without registration. No sign-up required.",
    icon: Ghost,
  },
  {
    title: "Secure Chats",
    description: "Your conversations are protected with end-to-end security.",
    icon: Shield,
  },
  {
    title: "Instant Sharing",
    description: "Share images and files seamlessly in your conversations.",
    icon: MessageCircle,
  },
];
