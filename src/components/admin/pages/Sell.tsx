import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Check, AlertTriangle, DollarSign, FileBox, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import { SITE_CATEGORIES } from '@/data/categories';

const fallbackCategories: Category[] = SITE_CATEGORIES.map((category) => ({
  ...category,
  created_at: new Date().toISOString(),
})) as Category[];

export default function Sell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [formats, setFormats] = useState<string[]>([]);
  const [isFree, setIsFree] = useState(false);
  const [licenseType, setLicenseType] = useState('Standard');
  const [saleType, setSaleType] = useState<'digital' | 'physical'>('digital');
  const [shippingCost, setShippingCost] = useState('');
  const [shippingDetails, setShippingDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const licenseOptions = [
    { value: 'Standard', label: 'Standard License', description: 'Personal use and limited commercial work.' },
    { value: 'Commercial', label: 'Commercial License', description: 'Use in client projects, promotional assets, and product sales.' },
    { value: 'Extended', label: 'Extended License', description: 'Broader commercial rights for large-scale production and redistribution.' },
  ];

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data && data.length > 0) ? data : fallbackCategories);
    });
  }, []);

  const toggleFormat = (fmt: string) => {
    setFormats((prev) => prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt]);
  };

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(imageUrl);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile, imageUrl]);

  const uploadToStorage = async (file: File, bucket: string, folder: string) => {
    const safeFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    const path = `${folder}/${Date.now()}-${safeFileName}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

    if (error) {
      if (error.message.toLowerCase().includes('bucket not found')) {
        throw new Error(`Storage bucket "${bucket}" was not found. Create it in Supabase Dashboard > Storage and make sure it is public.`);
      }
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/signin');
      return;
    }
    setError('');

    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!imageUrl.trim() && !imageFile) {
      setError('Please upload a preview image or provide an image URL.');
      return;
    }
    if (!isFree && (!price || parseFloat(price) < 0)) {
      setError('Please enter a valid price or mark as free.');
      return;
    }
    if (saleType === 'digital' && !modelFile) {
      setError('Please upload your 3D model file for digital listings.');
      return;
    }
    if (saleType === 'digital' && formats.length === 0) {
      setError('Please select at least one file format for digital models.');
      return;
    }
    if (saleType === 'physical' && shippingCost && parseFloat(shippingCost) < 0) {
      setError('Shipping cost cannot be negative.');
      return;
    }

    setLoading(true);
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    try {
      let uploadedImageUrl = imageUrl.trim();
      if (imageFile) {
        uploadedImageUrl = await uploadToStorage(imageFile, 'model-images', 'previews');
      }

      let uploadedModelUrl = null as string | null;
      if (modelFile) {
        uploadedModelUrl = await uploadToStorage(modelFile, 'model-files', 'models');
      }

      const { error: insertError } = await supabase.from('models').insert({
        title: title.trim(),
        slug,
        description: description.trim(),
        price: isFree ? 0 : parseFloat(price),
        category_id: category,
        seller_id: null,
        image_url: uploadedImageUrl,
        gallery: [uploadedImageUrl],
        file_formats: saleType === 'digital' ? formats : [],
        file_url: uploadedModelUrl,
        is_free: isFree,
        license_type: licenseType,
        sale_type: saleType,
        is_physical: saleType === 'physical',
        shipping_cost: saleType === 'physical' ? parseFloat(shippingCost || '0') : 0,
        shipping_details: saleType === 'physical' ? shippingDetails.trim() || null : null,
        textures: true,
        rigged: false,
        animated: false,
      });

      setLoading(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(true);
      setTitle(''); setDescription(''); setPrice(''); setCategory(''); setImageUrl(''); setImageFile(null); setImagePreview(''); setModelFile(null); setFormats([]); setIsFree(false); setLicenseType('Standard'); setSaleType('digital'); setShippingCost(''); setShippingDetails('');
      setTimeout(() => navigate(`/model/${slug}`), 2000);
    } catch (uploadError) {
      setLoading(false);
      const message = uploadError instanceof Error ? uploadError.message : 'File upload failed.';
      setError(message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Sign in to start selling</h1>
        <p className="text-gray-500 mt-2">You need an account to upload and sell 3D models.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/signin" className="btn-primary">Sign In</Link>
          <Link to="/signup" className="btn-secondary">Create Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upload a 3D Model</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to list your model on CreateLab.</p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-success-50 text-success-700 border border-success-200">
          <Check className="w-5 h-5" />
          <p className="text-sm font-medium">Model uploaded successfully! Redirecting...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-error-50 text-error-700 border border-error-200">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Model Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Medieval Castle Pack" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows={4} placeholder="Describe your model, its features, and what's included..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input cursor-pointer">
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Sale Type</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { value: 'digital', label: 'Digital Model', description: 'Sell a 3D file package or downloadable asset.' },
              { value: 'physical', label: 'Physical Object', description: 'Sell a printed or real-world item with shipping.' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSaleType(option.value as 'digital' | 'physical')}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  saleType === option.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    saleType === option.value ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                  }`}>
                    {saleType === option.value && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Pricing</h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFree(!isFree)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors text-left ${
                isFree ? 'border-success-500 bg-success-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 ${isFree ? 'border-success-500 bg-success-500' : 'border-gray-300'} flex items-center justify-center`}>
                  {isFree && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-medium text-gray-900">{saleType === 'physical' ? 'Free Item / Promo' : 'Free Download'}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">{saleType === 'physical' ? 'Offer the item for free as a promotional listing.' : 'List your model for free to build your audience.'}</p>
            </button>

            <div className={`flex-1 p-4 rounded-lg border-2 transition-colors ${!isFree ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); setIsFree(false); }}
                  className="w-full bg-transparent text-gray-900 font-medium focus:outline-none"
                  placeholder={saleType === 'physical' ? '69.99' : '29.99'}
                  disabled={isFree}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{saleType === 'physical' ? 'Set your physical item price (USD)' : 'Set your price (USD)'}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Commercial Licensing</h2>
          <div className="space-y-3">
            {licenseOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLicenseType(option.value)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  licenseType === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    licenseType === option.value ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                  }`}>
                    {licenseType === option.value && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Media & Files</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Preview Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) {
                  setImageUrl('');
                }
              }}
              className="input file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium"
            />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value.trim()) setImageFile(null);
              }}
              className="input mt-3"
              placeholder="Or paste an image URL: https://example.com/model-preview.jpg"
            />
            {imagePreview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          {saleType === 'digital' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileBox className="w-4 h-4 inline mr-1" />
                3D Model File *
              </label>
              <input
                type="file"
                accept=".fbx,.obj,.blend,.stl,.glb,.gltf,.zip,.3ds,.dwg,.3dm"
                onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
                className="input file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium"
              />
              {modelFile && <p className="mt-2 text-sm text-gray-600">Selected file: {modelFile.name}</p>}
              <div className="mt-4">
                <div className="text-xs font-medium text-gray-700 mb-2">File Formats *</div>
                <div className="flex flex-wrap gap-2">
                  {['FBX', 'OBJ', 'BLEND', 'ZTL', 'STL', 'GLB', '3DS', 'DWG', '3DM'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formats.includes(fmt)
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {saleType === 'physical' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Shipping Cost (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  className="input"
                  placeholder="12.50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Shipping & Packaging Details
                </label>
                <textarea
                  value={shippingDetails}
                  onChange={(e) => setShippingDetails(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Example: Ships in 3-5 business days, packed in recyclable material, ships worldwide, item is hand-finished and may vary slightly."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Uploading...' : 'Publish Model'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
