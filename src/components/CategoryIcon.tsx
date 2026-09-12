import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Tv,
  HeartPulse,
  GraduationCap,
  Receipt,
  Users,
  MoreHorizontal,
  Banknote,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Coffee,
  CreditCard,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', style }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} style={style} />;
    case 'Car':
      return <Car className={className} style={style} />;
    case 'Home':
      return <Home className={className} style={style} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} style={style} />;
    case 'Tv':
      return <Tv className={className} style={style} />;
    case 'HeartPulse':
      return <HeartPulse className={className} style={style} />;
    case 'GraduationCap':
      return <GraduationCap className={className} style={style} />;
    case 'Receipt':
      return <Receipt className={className} style={style} />;
    case 'Users':
      return <Users className={className} style={style} />;
    case 'Banknote':
      return <Banknote className={className} style={style} />;
    case 'Store':
      return <Store className={className} style={style} />;
    case 'Laptop':
      return <Laptop className={className} style={style} />;
    case 'TrendingUp':
      return <TrendingUp className={className} style={style} />;
    case 'Gift':
      return <Gift className={className} style={style} />;
    case 'PlusCircle':
      return <PlusCircle className={className} style={style} />;
    case 'ArrowDownLeft':
      return <ArrowDownLeft className={className} style={style} />;
    case 'ArrowUpRight':
      return <ArrowUpRight className={className} style={style} />;
    case 'Coffee':
      return <Coffee className={className} style={style} />;
    case 'CreditCard':
      return <CreditCard className={className} style={style} />;
    case 'Briefcase':
      return <Briefcase className={className} style={style} />;
    default:
      return <MoreHorizontal className={className} style={style} />;
  }
};
