import { BriefcaseBusiness, FileKey, Layers3, User } from 'lucide-react';

type LicenseDetails = {
  label: string;
  description: string;
  Icon: typeof User;
  className: string;
};

const licenseDetails: Record<string, LicenseDetails> = {
  Standard: {
    label: 'Personal Use',
    description: 'Personal-use license',
    Icon: User,
    className: 'bg-blue-50 text-blue-700',
  },
  Commercial: {
    label: 'Commercial Use',
    description: 'Commercial-use license',
    Icon: BriefcaseBusiness,
    className: 'bg-emerald-50 text-emerald-700',
  },
  Extended: {
    label: 'Extended Use',
    description: 'Extended license',
    Icon: Layers3,
    className: 'bg-violet-50 text-violet-700',
  },
};

export default function LicenseBadge({ licenseType }: { licenseType?: string | null }) {
  const details = licenseDetails[licenseType ?? ''] ?? {
    label: licenseType ? `${licenseType} License` : 'License details unavailable',
    description: 'Review the license details before purchase',
    Icon: FileKey,
    className: 'bg-gray-100 text-gray-700',
  };
  const Icon = details.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${details.className}`} title={details.description}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {details.label}
    </span>
  );
}
