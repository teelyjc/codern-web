import GoogleIcon from '@/assets/svg/google-icon.svg?url';
import { Button, ButtonProps } from '@/components/common/button';
import { Image } from '@/components/common/image';
import { ToastAction } from '@/components/common/toast';
import { useToast } from '@/hooks/toast-hook';
import { authService } from '@/services/auth-service';

type SignInWithGoogleButtonProps = Omit<ButtonProps, 'onClick'>;

export const SignInWithGoogleButton = (props: SignInWithGoogleButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    authService
      .getGoogleAuthUrl()
      .then((data) => {
        window.location.href = data;
      })
      .catch((error) => {
        toast({
          variant: 'danger',
          title: 'Cannot authenticate with Google',
          description: error.message,
          action: (
            <ToastAction
              altText="Try again"
              onClick={handleClick}
            >
              Try again
            </ToastAction>
          ),
        });
      });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      {...props}
    >
      <Image
        src={GoogleIcon}
        alt=""
        className="mr-2 h-4 w-4"
      />
      Sign in with Google
    </Button>
  );
};
