import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/store'
import { toast } from '@/hooks/use-toast'
import { MessageCircle, LogIn, UserPlus, Ghost } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate();
  const isInitialized = useStore(state => state.isInitialized);
  const { setToken, setName, setEmail, setUserId, setIsInitialized, setIsGuest } = useStore(
    (state) => ({
      setToken: state.setToken,
      setName: state.setName,
      setEmail: state.setEmail,
      setUserId: state.setUserId,
      setIsInitialized: state.setIsInitialized,
      setIsGuest: state.setIsGuest,
    })
  );

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
      const [, payload] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));

      setToken(token);
      setUserId(decodedPayload.id);
      setName(decodedPayload.name);
      setEmail(decodedPayload.email);
      setIsInitialized(true);
      setIsGuest(true);

      localStorage.setItem('token', token);
      navigate('/chat');
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
            {isInitialized ? (
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
            className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index + 0.8 }}
                className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-colors"
              >
                <feature.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
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
    title: "Real-time Chat",
    description: "Experience instant messaging with real-time message delivery and typing indicators.",
    icon: MessageCircle,
  },
  {
    title: "No Installation",
    description: "Start chatting right away through your browser. No downloads required.",
    icon: Ghost,
  },
  {
    title: "Secure",
    description: "Your conversations are protected with modern security practices.",
    icon: LogIn,
  },
];
