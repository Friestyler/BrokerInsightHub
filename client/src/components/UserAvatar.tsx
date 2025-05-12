import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ src, name, size = 'md', className = '' }: UserAvatarProps) {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Define size styles
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };
  
  // Generate a deterministic background color based on the name
  const colors = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-purple-500'
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  return (
    <Avatar className={`${sizeStyles[size]} ${className}`}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className={`${bgColor} text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}