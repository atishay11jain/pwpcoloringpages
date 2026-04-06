'use client';

import { useRouter } from 'next/navigation';
import UploadForm from '../../components/UploadForm';

export default function NewPagePage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to pages list after successful upload
    setTimeout(() => {
      router.push('/admin/pages');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload New Coloring Page</h1>
        <p className="text-gray-400 mt-1">
          Add a new coloring page to your collection
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
        <UploadForm onSuccess={handleSuccess} />
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-white font-semibold mb-3">Tips for best results</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Use high-resolution images (at least 1500px wide) for best print quality
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Upload both B&W and color versions - each will be processed separately
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Each image generates 4 formats: thumbnail, preview, JPEG, and PDF
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Choose descriptive titles and complete SEO fields for better discoverability
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You can upload just one version if needed, but both is recommended
          </li>
        </ul>
      </div>
    </div>
  );
}
