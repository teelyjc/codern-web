import { Badge } from '@/components/common/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/common/dropdown';
import { Image } from '@/components/common/image';
import { useUser } from '@/hooks/auth-hook';
import { RoutePath } from '@/libs/constants';
import { authService } from '@/services/auth-service';
import { UserAccountType } from '@/types/auth-type';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDownIcon, LockIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export type UserProfileDropdownProps = {
  displayName: string;
  email: string;
  accountType: UserAccountType;
};

export const UserProfileDropdown = ({
  displayName,
  email,
  accountType,
}: UserProfileDropdownProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useUser();

  const signOut = () => {
    authService.signOut().finally(() => {
      queryClient.removeQueries();
      navigate(RoutePath.SIGNIN);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-row items-center space-x-1 rounded-sm focus-visible:outline-none">
        <Image
          src={user?.profileUrl}
          alt=""
          className="h-8 w-8 select-none rounded-md"
        />
        <ChevronDownIcon className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-2"
      >
        <DropdownMenuLabel className="flex flex-row items-start justify-between font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
          {accountType === UserAccountType.PRO && <Badge>Pro</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={RoutePath.CHANGE_PASSWORD}>
              <LockIcon className="mr-2 h-4 w-4" />
              <span>Change password</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={RoutePath.FALLBACK_ACCOUNT_SETTINGS}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={signOut}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
