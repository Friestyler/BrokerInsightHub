import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEntityLogo } from '@/hooks/useEntityLogo';

interface EntityAvatarProps {
  entityType: 'partner' | 'customer';
  entityId: number;
  fallbackText: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-12 w-12'
};

export default function EntityAvatar({ 
  entityType, 
  entityId, 
  fallbackText, 
  className = "",
  size = 'md'
}: EntityAvatarProps) {
  const { logoUrl, isLoading } = useEntityLogo(entityType, entityId);

  const avatarClasses = `${sizeClasses[size]} ${className}`;

  return (
    <Avatar className={avatarClasses}>
      {logoUrl && !isLoading && (
        <AvatarImage 
          src={logoUrl} 
          alt={`${entityType} logo`}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
}