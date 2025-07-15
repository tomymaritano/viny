import React from 'react'
import {
  Eye,
  EyeOff,
  Edit,
  Edit3,
  Maximize2,
  Minimize2,
  MoreVertical,
  X,
  FileText,
  Star,
  Book,
  Trash2,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Tag,
  Download,
  Copy,
  FolderOpen,
  PanelRight,
  Check,
  AlertTriangle,
  Info,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Clock4,
  Circle,
  RefreshCw,
  Search,
  Loader,
  Folder,
  Move,
  Sidebar,
  FileEdit,
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Code,
  Quote,
  Table,
  Command,
  Heading1,
  SquarePen,
  Heading2,
  Heading3,
  Code2,
  Minus,
  Strikethrough,
  Hash,
  Type,
  RotateCw,
  AlertCircle,
  Upload,
  Package,
  Layout,
  User,
  Briefcase,
  Globe,
  ArrowRight as ArrowRightIcon,
  Loader2,
  ArrowDownAZ,
  ArrowUpAZ,
  NotebookPen,
  Menu,
  Database,
  Pin,
  FileChartLine,
  NotebookText,
  Archive,
  Cloud,
  Edit2,
  RotateCcw,
  HardDrive,
  Sun,
  Moon,
  Monitor,
  Palette,
} from 'lucide-react'

interface IconProps {
  size?: number
  className?: string
}

// Unified icon library using lucide-react
// All icons use consistent stroke width and style
const Icons = {
  // View and editing icons
  Eye: ({ size = 16, className = '' }: IconProps) => (
    <Eye size={size} className={className} />
  ),

  EyeOff: ({ size = 16, className = '' }: IconProps) => (
    <EyeOff size={size} className={className} />
  ),

  Edit: ({ size = 16, className = '' }: IconProps) => (
    <Edit size={size} className={className} />
  ),

  EditActive: ({ size = 16, className = '' }: IconProps) => (
    <Edit3 size={size} className={className} />
  ),

  SquarePen: ({ size = 16, className = '' }: IconProps) => (
    <SquarePen size={size} className={className} />
  ),

  Maximize: ({ size = 16, className = '' }: IconProps) => (
    <Maximize2 size={size} className={className} />
  ),

  Minimize: ({ size = 16, className = '' }: IconProps) => (
    <Minimize2 size={size} className={className} />
  ),

  // Menu and navigation icons
  MoreVertical: ({ size = 16, className = '' }: IconProps) => (
    <MoreVertical size={size} className={className} />
  ),

  X: ({ size = 16, className = '' }: IconProps) => <X size={size} className={className} />,

  // Sidebar icons
  FileText: ({ size = 16, className = '' }: IconProps) => (
    <FileText size={size} className={className} />
  ),

  Star: ({ size = 16, className = '' }: IconProps) => (
    <Star size={size} className={className} />
  ),

  Book: ({ size = 16, className = '' }: IconProps) => (
    <Book size={size} className={className} />
  ),

  Trash: ({ size = 16, className = '' }: IconProps) => (
    <Trash2 size={size} className={className} />
  ),

  Settings: ({ size = 16, className = '' }: IconProps) => (
    <Settings size={size} className={className} />
  ),

  Plus: ({ size = 16, className = '' }: IconProps) => (
    <Plus size={size} className={className} />
  ),

  ChevronDown: ({ size = 16, className = '' }: IconProps) => (
    <ChevronDown size={size} className={className} />
  ),

  ChevronRight: ({ size = 16, className = '' }: IconProps) => (
    <ChevronRight size={size} className={className} />
  ),

  // Action icons
  Tag: ({ size = 16, className = '' }: IconProps) => (
    <Tag size={size} className={className} />
  ),

  Download: ({ size = 16, className = '' }: IconProps) => (
    <Download size={size} className={className} />
  ),

  Copy: ({ size = 16, className = '' }: IconProps) => (
    <Copy size={size} className={className} />
  ),

  FolderOpen: ({ size = 16, className = '' }: IconProps) => (
    <FolderOpen size={size} className={className} />
  ),

  PanelRight: ({ size = 16, className = '' }: IconProps) => (
    <PanelRight size={size} className={className} />
  ),

  Check: ({ size = 16, className = '' }: IconProps) => (
    <Check size={size} className={className} />
  ),

  AlertTriangle: ({ size = 16, className = '' }: IconProps) => (
    <AlertTriangle size={size} className={className} />
  ),

  Info: ({ size = 16, className = '' }: IconProps) => (
    <Info size={size} className={className} />
  ),

  Lightbulb: ({ size = 16, className = '' }: IconProps) => (
    <Lightbulb size={size} className={className} />
  ),

  // Status icons
  CheckCircle: ({ size = 16, className = '' }: IconProps) => (
    <CheckCircle size={size} className={className} />
  ),

  XCircle: ({ size = 16, className = '' }: IconProps) => (
    <XCircle size={size} className={className} />
  ),

  Clock: ({ size = 16, className = '' }: IconProps) => (
    <Clock size={size} className={className} />
  ),

  Clock4: ({ size = 16, className = '' }: IconProps) => (
    <Clock4 size={size} className={className} />
  ),

  Circle: ({ size = 16, className = '' }: IconProps) => (
    <Circle size={size} className={className} />
  ),

  RefreshCw: ({ size = 16, className = '' }: IconProps) => (
    <RefreshCw size={size} className={className} />
  ),

  Search: ({ size = 16, className = '' }: IconProps) => (
    <Search size={size} className={className} />
  ),

  Loader: ({ size = 16, className = '' }: IconProps) => (
    <Loader size={size} className={className} />
  ),

  Folder: ({ size = 16, className = '' }: IconProps) => (
    <Folder size={size} className={className} />
  ),

  Move: ({ size = 16, className = '' }: IconProps) => (
    <Move size={size} className={className} />
  ),

  Sidebar: ({ size = 16, className = '' }: IconProps) => (
    <Sidebar size={size} className={className} />
  ),

  Markdown: ({ size = 16, className = '' }: IconProps) => (
    <FileEdit size={size} className={className} />
  ),

  ArrowLeft: ({ size = 16, className = '' }: IconProps) => (
    <ArrowLeft size={size} className={className} />
  ),

  // Text formatting icons
  Bold: ({ size = 16, className = '' }: IconProps) => (
    <Bold size={size} className={className} />
  ),

  Italic: ({ size = 16, className = '' }: IconProps) => (
    <Italic size={size} className={className} />
  ),

  // List icons
  List: ({ size = 16, className = '' }: IconProps) => (
    <List size={size} className={className} />
  ),

  ListOrdered: ({ size = 16, className = '' }: IconProps) => (
    <ListOrdered size={size} className={className} />
  ),

  CheckSquare: ({ size = 16, className = '' }: IconProps) => (
    <CheckSquare size={size} className={className} />
  ),

  // Insert icons
  Link: ({ size = 16, className = '' }: IconProps) => (
    <Link size={size} className={className} />
  ),

  Image: ({ size = 16, className = '' }: IconProps) => (
    <Image size={size} className={className} />
  ),

  Code: ({ size = 16, className = '' }: IconProps) => (
    <Code size={size} className={className} />
  ),

  Quote: ({ size = 16, className = '' }: IconProps) => (
    <Quote size={size} className={className} />
  ),

  Table: ({ size = 16, className = '' }: IconProps) => (
    <Table size={size} className={className} />
  ),

  // Heading icons
  Heading1: ({ size = 16, className = '' }: IconProps) => (
    <Heading1 size={size} className={className} />
  ),

  Heading2: ({ size = 16, className = '' }: IconProps) => (
    <Heading2 size={size} className={className} />
  ),

  Heading3: ({ size = 16, className = '' }: IconProps) => (
    <Heading3 size={size} className={className} />
  ),

  // Additional formatting icons
  Code2: ({ size = 16, className = '' }: IconProps) => (
    <Code2 size={size} className={className} />
  ),

  Minus: ({ size = 16, className = '' }: IconProps) => (
    <Minus size={size} className={className} />
  ),

  Strikethrough: ({ size = 16, className = '' }: IconProps) => (
    <Strikethrough size={size} className={className} />
  ),

  // Status bar icons
  Hash: ({ size = 16, className = '' }: IconProps) => (
    <Hash size={size} className={className} />
  ),

  Type: ({ size = 16, className = '' }: IconProps) => (
    <Type size={size} className={className} />
  ),

  RotateCw: ({ size = 16, className = '' }: IconProps) => (
    <RotateCw size={size} className={className} />
  ),

  AlertCircle: ({ size = 16, className = '' }: IconProps) => (
    <AlertCircle size={size} className={className} />
  ),

  Upload: ({ size = 16, className = '' }: IconProps) => (
    <Upload size={size} className={className} />
  ),

  Package: ({ size = 16, className = '' }: IconProps) => (
    <Package size={size} className={className} />
  ),

  FileTemplate: ({ size = 16, className = '' }: IconProps) => (
    <Layout size={size} className={className} />
  ),

  User: ({ size = 16, className = '' }: IconProps) => (
    <User size={size} className={className} />
  ),

  Briefcase: ({ size = 16, className = '' }: IconProps) => (
    <Briefcase size={size} className={className} />
  ),

  Globe: ({ size = 16, className = '' }: IconProps) => (
    <Globe size={size} className={className} />
  ),

  ArrowRight: ({ size = 16, className = '' }: IconProps) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),

  // Additional icons for missing references
  Loader2: ({ size = 16, className = '' }: IconProps) => (
    <Loader2 size={size} className={className} />
  ),

  ArrowDownAZ: ({ size = 16, className = '' }: IconProps) => (
    <ArrowDownAZ size={size} className={className} />
  ),

  ArrowUpAZ: ({ size = 16, className = '' }: IconProps) => (
    <ArrowUpAZ size={size} className={className} />
  ),

  NotebookPen: ({ size = 16, className = '' }: IconProps) => (
    <NotebookPen size={size} className={className} />
  ),

  Menu: ({ size = 16, className = '' }: IconProps) => (
    <Menu size={size} className={className} />
  ),

  Database: ({ size = 16, className = '' }: IconProps) => (
    <Database size={size} className={className} />
  ),

  Pin: ({ size = 16, className = '' }: IconProps) => (
    <Pin size={size} className={className} />
  ),

  FileChartLine: ({ size = 16, className = '' }: IconProps) => (
    <FileChartLine size={size} className={className} />
  ),

  Archive: ({ size = 16, className = '' }: IconProps) => (
    <Archive size={size} className={className} />
  ),

  NotebookText: ({ size = 16, className = '' }: IconProps) => (
    <NotebookText size={size} className={className} />
  ),

  Command: ({ size = 16, className = '' }: IconProps) => (
    <Command size={size} className={className} />
  ),

  // Settings icons
  Cloud: ({ size = 16, className = '' }: IconProps) => (
    <Cloud size={size} className={className} />
  ),

  Edit2: ({ size = 16, className = '' }: IconProps) => (
    <Edit2 size={size} className={className} />
  ),

  RotateCcw: ({ size = 16, className = '' }: IconProps) => (
    <RotateCcw size={size} className={className} />
  ),

  HardDrive: ({ size = 16, className = '' }: IconProps) => (
    <HardDrive size={size} className={className} />
  ),

  Sun: ({ size = 16, className = '' }: IconProps) => (
    <Sun size={size} className={className} />
  ),

  Moon: ({ size = 16, className = '' }: IconProps) => (
    <Moon size={size} className={className} />
  ),

  Monitor: ({ size = 16, className = '' }: IconProps) => (
    <Monitor size={size} className={className} />
  ),

  Palette: ({ size = 16, className = '' }: IconProps) => (
    <Palette size={size} className={className} />
  ),
}

export default Icons
