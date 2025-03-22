'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Token {
  token_key: string;
  token_id1: string;
}

interface TokenData {
  server_id: number;
  token_key: string;
  token_type: number;
  token_id1: number;
  token_id2: number;
  token_created: string;
  token_description: string | null;
  token_customset: string | null;
  token_from_client_id: string | null;
}

interface DbStatus {
  success: boolean;
  data?: TokenData[];
  error?: string;
}

export default function Home() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Token>({
    token_key: '',
    token_id1: ''
  });
  const [formStatus, setFormStatus] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/test');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setDbStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setFormStatus({
          success: true,
          message: 'Token added successfully'
        });
        setShowForm(false);
        setFormData({
          token_key: '',
          token_id1: ''
        });
        fetchTokens(); // Listeyi yenile
      } else {
        setFormStatus({
          success: false,
          error: data.error || 'Failed to add token'
        });
      }
    } catch (error) {
      setFormStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add token'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Connection Test</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add New Token'}
        </button>
      </div>
      
      {formStatus && (
        <div className={`p-4 mb-4 rounded ${formStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {formStatus.success ? formStatus.message : formStatus.error}
        </div>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Add New Token</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Token Key</label>
              <input
                type="text"
                name="token_key"
                value={formData.token_key}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Token Type</label>
              <select
                name="token_id1"
                value={formData.token_id1}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select a type</option>
                <option value="2">Server Admin Query</option>
                <option value="6">Server Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Token
            </button>
          </div>
        </form>
      )}
      
      {dbStatus === null ? (
        <p>Testing database connection...</p>
      ) : dbStatus.success ? (
        <div>
          <p className="text-green-600">✅ Database connection successful!</p>
          {dbStatus.data && dbStatus.data.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Tokens:</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      {Object.keys(dbStatus.data[0]).map((key) => (
                        <th key={key} className="border p-2 bg-gray-100">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dbStatus.data.map((token, index) => (
                      <tr key={index}>
                        {Object.values(token).map((value: string | number | null, i) => (
                          <td key={i} className="border p-2">
                            {value?.toString() ?? 'null'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-600">❌ Error: {dbStatus.error}</p>
      )}

      <div className="flex justify-end p-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
