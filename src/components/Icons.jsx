/* eslint-disable react/prop-types */
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
  Heading1,
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
} from 'lucide-react'

// Unified icon library using lucide-react
// All icons use consistent stroke width and style
const Icons = {
  // View and editing icons
  Eye: ({ size = 16, className = '' }) => (
    <Eye size={size} className={className} />
  ),

  EyeOff: ({ size = 16, className = '' }) => (
    <EyeOff size={size} className={className} />
  ),

  Edit: ({ size = 16, className = '' }) => (
    <Edit size={size} className={className} />
  ),

  EditActive: ({ size = 16, className = '' }) => (
    <Edit3 size={size} className={className} />
  ),

  Maximize: ({ size = 16, className = '' }) => (
    <Maximize2 size={size} className={className} />
  ),

  Minimize: ({ size = 16, className = '' }) => (
    <Minimize2 size={size} className={className} />
  ),

  // Menu and navigation icons
  MoreVertical: ({ size = 16, className = '' }) => (
    <MoreVertical size={size} className={className} />
  ),

  X: ({ size = 16, className = '' }) => <X size={size} className={className} />,

  // Sidebar icons
  FileText: ({ size = 16, className = '' }) => (
    <FileText size={size} className={className} />
  ),

  Star: ({ size = 16, className = '' }) => (
    <Star size={size} className={className} />
  ),

  Book: ({ size = 16, className = '' }) => (
    <Book size={size} className={className} />
  ),

  Trash: ({ size = 16, className = '' }) => (
    <Trash2 size={size} className={className} />
  ),

  Settings: ({ size = 16, className = '' }) => (
    <Settings size={size} className={className} />
  ),

  Plus: ({ size = 16, className = '' }) => (
    <Plus size={size} className={className} />
  ),

  ChevronDown: ({ size = 16, className = '' }) => (
    <ChevronDown size={size} className={className} />
  ),

  ChevronRight: ({ size = 16, className = '' }) => (
    <ChevronRight size={size} className={className} />
  ),

  // Action icons
  Tag: ({ size = 16, className = '' }) => (
    <Tag size={size} className={className} />
  ),

  Download: ({ size = 16, className = '' }) => (
    <Download size={size} className={className} />
  ),

  Copy: ({ size = 16, className = '' }) => (
    <Copy size={size} className={className} />
  ),

  FolderOpen: ({ size = 16, className = '' }) => (
    <FolderOpen size={size} className={className} />
  ),

  PanelRight: ({ size = 16, className = '' }) => (
    <PanelRight size={size} className={className} />
  ),

  Check: ({ size = 16, className = '' }) => (
    <Check size={size} className={className} />
  ),

  AlertTriangle: ({ size = 16, className = '' }) => (
    <AlertTriangle size={size} className={className} />
  ),

  Info: ({ size = 16, className = '' }) => (
    <Info size={size} className={className} />
  ),

  Lightbulb: ({ size = 16, className = '' }) => (
    <Lightbulb size={size} className={className} />
  ),

  // Status icons
  CheckCircle: ({ size = 16, className = '' }) => (
    <CheckCircle size={size} className={className} />
  ),

  XCircle: ({ size = 16, className = '' }) => (
    <XCircle size={size} className={className} />
  ),

  Clock: ({ size = 16, className = '' }) => (
    <Clock size={size} className={className} />
  ),

  Circle: ({ size = 16, className = '' }) => (
    <Circle size={size} className={className} />
  ),

  RefreshCw: ({ size = 16, className = '' }) => (
    <RefreshCw size={size} className={className} />
  ),

  Search: ({ size = 16, className = '' }) => (
    <Search size={size} className={className} />
  ),

  Loader: ({ size = 16, className = '' }) => (
    <Loader size={size} className={className} />
  ),

  Folder: ({ size = 16, className = '' }) => (
    <Folder size={size} className={className} />
  ),

  Move: ({ size = 16, className = '' }) => (
    <Move size={size} className={className} />
  ),

  Sidebar: ({ size = 16, className = '' }) => (
    <Sidebar size={size} className={className} />
  ),

  Markdown: ({ size = 16, className = '' }) => (
    <FileEdit size={size} className={className} />
  ),

  ArrowLeft: ({ size = 16, className = '' }) => (
    <ArrowLeft size={size} className={className} />
  ),

  // Text formatting icons
  Bold: ({ size = 16, className = '' }) => (
    <Bold size={size} className={className} />
  ),

  Italic: ({ size = 16, className = '' }) => (
    <Italic size={size} className={className} />
  ),

  // List icons
  List: ({ size = 16, className = '' }) => (
    <List size={size} className={className} />
  ),

  ListOrdered: ({ size = 16, className = '' }) => (
    <ListOrdered size={size} className={className} />
  ),

  CheckSquare: ({ size = 16, className = '' }) => (
    <CheckSquare size={size} className={className} />
  ),

  // Insert icons
  Link: ({ size = 16, className = '' }) => (
    <Link size={size} className={className} />
  ),

  Image: ({ size = 16, className = '' }) => (
    <Image size={size} className={className} />
  ),

  Code: ({ size = 16, className = '' }) => (
    <Code size={size} className={className} />
  ),

  Quote: ({ size = 16, className = '' }) => (
    <Quote size={size} className={className} />
  ),

  Table: ({ size = 16, className = '' }) => (
    <Table size={size} className={className} />
  ),

  // Heading icons
  Heading1: ({ size = 16, className = '' }) => (
    <Heading1 size={size} className={className} />
  ),

  Heading2: ({ size = 16, className = '' }) => (
    <Heading2 size={size} className={className} />
  ),

  Heading3: ({ size = 16, className = '' }) => (
    <Heading3 size={size} className={className} />
  ),

  // Additional formatting icons
  Code2: ({ size = 16, className = '' }) => (
    <Code2 size={size} className={className} />
  ),

  Minus: ({ size = 16, className = '' }) => (
    <Minus size={size} className={className} />
  ),

  Strikethrough: ({ size = 16, className = '' }) => (
    <Strikethrough size={size} className={className} />
  ),

  // Status bar icons
  Hash: ({ size = 16, className = '' }) => (
    <Hash size={size} className={className} />
  ),

  Type: ({ size = 16, className = '' }) => (
    <Type size={size} className={className} />
  ),

  RotateCw: ({ size = 16, className = '' }) => (
    <RotateCw size={size} className={className} />
  ),

  AlertCircle: ({ size = 16, className = '' }) => (
    <AlertCircle size={size} className={className} />
  ),

  Upload: ({ size = 16, className = '' }) => (
    <Upload size={size} className={className} />
  ),

  Package: ({ size = 16, className = '' }) => (
    <Package size={size} className={className} />
  ),
}

export default Icons
