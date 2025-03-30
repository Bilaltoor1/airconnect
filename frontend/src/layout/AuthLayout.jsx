import { Outlet } from 'react-router-dom'
import FloatingShape from '../components/FloatingShape'

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-base-100">
      {/* Decorative floating shapes - positioned absolutely so they don't affect layout flow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingShape color='bg-primary/20' size='w-64 h-64' top='-5%' left='10%' delay={0} />
        <FloatingShape color='bg-accent/20' size='w-48 h-48' top='70%' left='80%' delay={5} />
        <FloatingShape color='bg-secondary/20' size='w-32 h-32' top='40%' left='-10%' delay={2} />
      </div>
      
      {/* Main content - will scroll when needed */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout