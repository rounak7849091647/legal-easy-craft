import { Dialog, DialogContent } from '@/components/ui/dialog';
import AuthPage from './AuthPage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-0 border-0 bg-transparent overflow-hidden">
        <AuthPage onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
