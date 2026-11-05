export { default as Logo } from './Logo';
export { default as AnimatedLogo } from './AnimatedLogo';
export { default as Input } from './Input';
export { default as Button } from './Button';
export { default as AvatarPicker } from './AvatarPicker';
export { default as BackButton } from './BackButton';
export { default as AuthLink } from './AuthLink';
export { default as NeumorphicView } from './NeumorphicView';
export { default as WelcomeBar } from './WelcomeBar';
export { default as MetricCard } from './MetricCard';
export { default as QuickActionBar } from './QuickActionBar';
export {
    default as ClientCard,
    formatCnpj,
    getStatusConfig,
    getPotentialColor,
} from './ClientCard';
export { default as ClientFilterTabs } from './ClientFilterTabs';
export { default as ClientSearchBar } from './ClientSearchBar';
export { default as ClientEmptyState } from './ClientEmptyState';
export { default as ClientErrorState } from './ClientErrorState';

// Componentes modulares do formulário de clientes
export {
    default as ClientFormCnpjField,
    formatCnpjInput,
    extractCnpjDigits,
} from './ClientFormCnpjField';
export { default as ClientFormStatusSelector } from './ClientFormStatusSelector';
export { default as ClientFormPotentialSelector } from './ClientFormPotentialSelector';
export { default as ClientFormScoreSelector } from './ClientFormScoreSelector';

// Componentes modulares do chat com Assistente IA
export { default as AiOrb } from './AiOrb';
export { default as AiChatMessageBubble } from './AiChatMessageBubble';
export { default as AiChatPromptSuggestions } from './AiChatPromptSuggestions';
export { default as AiChatComposer } from './AiChatComposer';
