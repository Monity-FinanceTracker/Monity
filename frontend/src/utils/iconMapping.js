import React from 'react';
import { 
    Home, UtensilsCrossed, Car, Banknote, Gamepad2, ShoppingBag,
    Heart, BookOpen, Plane, Zap, Music, Dumbbell, Briefcase, 
    Smartphone, Package, Plus, Search, X, Trash2, Edit, Calendar,
    TrendingUp, TrendingDown, PieChart, BarChart3, Settings, User,
    Bell, AlertTriangle, CheckCircle, XCircle, Info, RotateCcw,
    MessageCircle, Play, Upload, Download, Filter, Eye, EyeOff,
    Lock, Unlock, Star, StarOff, ThumbsUp, ThumbsDown, Share2,
    Copy, ExternalLink, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Menu,
    MoreHorizontal, MoreVertical, Grid, List, Map, Calendar as CalendarIcon,
    Clock, Timer, Stopwatch, Alarm, Sun, Moon, Cloud, CloudRain,
    Wifi, WifiOff, Battery, BatteryLow, Volume2, VolumeX, Mic, MicOff,
    Camera, Image, Video, File, FileText, Folder, FolderOpen,
    Save, Archive, Bookmark, Tag, Flag, Pin, Paperclip, Link2,
    Send, Mail, Phone, MessageSquare, Users, UserPlus, UserMinus,
    Shield, ShieldCheck, Key, CreditCard, Wallet, Receipt, Calculator,
    Globe, MapPin, Navigation, Compass, Target, Crosshair, Maximize2,
    Minimize2, ZoomIn, ZoomOut, RefreshCcw, Power, LogOut, LogIn
} from 'lucide-react';

/**
 * Centralized icon mapping for the Monity application
 * Maps string identifiers to Lucide React icon components
 */
export const iconMap = {
    // Category Icons
    'Home': Home,
    'UtensilsCrossed': UtensilsCrossed,
    'Car': Car,
    'Banknote': Banknote,
    'DollarSign': Banknote, // Backwards compatibility
    'Gamepad2': Gamepad2,
    'ShoppingBag': ShoppingBag,
    'Heart': Heart,
    'BookOpen': BookOpen,
    'Plane': Plane,
    'Zap': Zap,
    'Music': Music,
    'Dumbbell': Dumbbell,
    'Briefcase': Briefcase,
    'Smartphone': Smartphone,
    'Package': Package,

    // Action Icons
    'Plus': Plus,
    'Search': Search,
    'X': X,
    'Trash2': Trash2,
    'Edit': Edit,
    'Calendar': Calendar,
    'Upload': Upload,
    'Download': Download,
    'Filter': Filter,
    'Copy': Copy,
    'Share2': Share2,
    'ExternalLink': ExternalLink,
    'Save': Save,
    'Archive': Archive,

    // Navigation Icons
    'ArrowLeft': ArrowLeft,
    'ArrowRight': ArrowRight,
    'ArrowUp': ArrowUp,
    'ArrowDown': ArrowDown,
    'ChevronLeft': ChevronLeft,
    'ChevronRight': ChevronRight,
    'ChevronUp': ChevronUp,
    'ChevronDown': ChevronDown,
    'Menu': Menu,
    'MoreHorizontal': MoreHorizontal,
    'MoreVertical': MoreVertical,

    // Chart & Analytics Icons
    'TrendingUp': TrendingUp,
    'TrendingDown': TrendingDown,
    'PieChart': PieChart,
    'BarChart3': BarChart3,

    // UI State Icons
    'Eye': Eye,
    'EyeOff': EyeOff,
    'Lock': Lock,
    'Unlock': Unlock,
    'Star': Star,
    'StarOff': StarOff,
    'ThumbsUp': ThumbsUp,
    'ThumbsDown': ThumbsDown,

    // Status Icons
    'CheckCircle': CheckCircle,
    'XCircle': XCircle,
    'AlertTriangle': AlertTriangle,
    'Info': Info,
    'Bell': Bell,

    // System Icons
    'Settings': Settings,
    'User': User,
    'Users': Users,
    'UserPlus': UserPlus,
    'UserMinus': UserMinus,
    'Shield': Shield,
    'ShieldCheck': ShieldCheck,
    'Key': Key,
    'Power': Power,
    'LogOut': LogOut,
    'LogIn': LogIn,

    // Media Icons
    'Play': Play,
    'Camera': Camera,
    'Image': Image,
    'Video': Video,
    'Volume2': Volume2,
    'VolumeX': VolumeX,
    'Mic': Mic,
    'MicOff': MicOff,

    // File Icons
    'File': File,
    'FileText': FileText,
    'Folder': Folder,
    'FolderOpen': FolderOpen,
    'Bookmark': Bookmark,
    'Tag': Tag,
    'Flag': Flag,
    'Pin': Pin,
    'Paperclip': Paperclip,
    'Link2': Link2,

    // Communication Icons
    'Send': Send,
    'Mail': Mail,
    'Phone': Phone,
    'MessageSquare': MessageSquare,
    'MessageCircle': MessageCircle,

    // Financial Icons
    'CreditCard': CreditCard,
    'Wallet': Wallet,
    'Receipt': Receipt,
    'Calculator': Calculator,

    // Location Icons
    'Globe': Globe,
    'MapPin': MapPin,
    'Navigation': Navigation,
    'Compass': Compass,
    'Target': Target,
    'Crosshair': Crosshair,
    'Map': Map,

    // Time Icons
    'Clock': Clock,
    'Timer': Timer,
    'Stopwatch': Stopwatch,
    'Alarm': Alarm,
    'CalendarIcon': CalendarIcon,

    // Weather Icons
    'Sun': Sun,
    'Moon': Moon,
    'Cloud': Cloud,
    'CloudRain': CloudRain,

    // Device Icons
    'Wifi': Wifi,
    'WifiOff': WifiOff,
    'Battery': Battery,
    'BatteryLow': BatteryLow,

    // Layout Icons
    'Grid': Grid,
    'List': List,
    'Maximize2': Maximize2,
    'Minimize2': Minimize2,
    'ZoomIn': ZoomIn,
    'ZoomOut': ZoomOut,

    // Refresh Icons
    'RotateCcw': RotateCcw,
    'RefreshCcw': RefreshCcw,
};

/**
 * Category icon options with labels for UI selection
 */
export const categoryIconOptions = [
    { name: 'Home', icon: Home, label: 'Home' },
    { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Food & Dining' },
    { name: 'Car', icon: Car, label: 'Transportation' },
    { name: 'Banknote', icon: Banknote, label: 'Finance' },
    { name: 'Gamepad2', icon: Gamepad2, label: 'Entertainment' },
    { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
    { name: 'Heart', icon: Heart, label: 'Health & Wellness' },
    { name: 'BookOpen', icon: BookOpen, label: 'Education' },
    { name: 'Plane', icon: Plane, label: 'Travel' },
    { name: 'Zap', icon: Zap, label: 'Utilities' },
    { name: 'Music', icon: Music, label: 'Music & Audio' },
    { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
    { name: 'Briefcase', icon: Briefcase, label: 'Business & Work' },
    { name: 'Smartphone', icon: Smartphone, label: 'Technology' },
    { name: 'Package', icon: Package, label: 'General' }
];

/**
 * Get an icon component by name
 * @param {string} iconName - The name of the icon
 * @param {string} fallback - Fallback icon name if the requested icon doesn't exist
 * @returns {React.Component} The icon component
 */
export const getIcon = (iconName, fallback = 'Package') => {
    return iconMap[iconName] || iconMap[fallback] || Package;
};

/**
 * Check if an icon exists in the mapping
 * @param {string} iconName - The name of the icon to check
 * @returns {boolean} Whether the icon exists
 */
export const hasIcon = (iconName) => {
    return iconName in iconMap;
};

/**
 * Get all available icon names
 * @returns {string[]} Array of all icon names
 */
export const getAvailableIconNames = () => {
    return Object.keys(iconMap);
};

/**
 * Icon component wrapper for consistent sizing and styling
 * @param {Object} props - Component props
 * @param {string} props.name - Icon name
 * @param {string} props.size - Size preset (xs, sm, md, lg, xl, xxl)
 * @param {string} props.className - Additional CSS classes
 * @returns {React.Component} Wrapped icon component
 */
export const Icon = ({ name, size = 'md', className = '', ...props }) => {
    const IconComponent = getIcon(name);
    
    const sizeClasses = {
        xs: 'w-3 h-3',    // 12px
        sm: 'w-4 h-4',    // 16px
        md: 'w-5 h-5',    // 20px
        lg: 'w-6 h-6',    // 24px
        xl: 'w-8 h-8',    // 32px
        xxl: 'w-12 h-12'  // 48px
    };
    
    const sizeClass = sizeClasses[size] || sizeClasses.md;
    
    return (
        <IconComponent 
            className={`${sizeClass} ${className}`} 
            {...props} 
        />
    );
};

export default iconMap;
