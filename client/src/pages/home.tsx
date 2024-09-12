import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0.0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="grid gap-4"
    >
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Chat App
      </h1>
      <p className="text-xl text-muted-foreground">
        Say "hello" to a different messaging experience. An unexpected focus
        on privacy, combined with all of the features you expect.
      </p>
      <div className="flex gap-10 justify-start">
        <Link to="/login">
          <Button>Login</Button>
        </Link>
        <Link to="/register">
          <Button>Register</Button>
        </Link>
        <Link to="/chat">
          <Button variant="outline">Guest Login</Button>
        </Link>
      </div>
    </motion.div>
  )
}
