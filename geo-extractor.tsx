import React, { useState } from 'react';
import { Upload, Download, MapPin, Image as ImageIcon, FileText } from 'lucide-react';
// @ts-ignore - EXIF library
import EXIF from 'exif-js';

interface ImageData {
  name: string;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

const GeoExtractor: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'results'>('home');
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string): number => {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
      dd = dd * -1;
    }
    return dd;
  };

  const extractGPSData = (file: File): Promise<ImageData> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // @ts-ignore
          EXIF.getData(img, function() {
            // @ts-ignore
            const lat = EXIF.getTag(this, 'GPSLatitude');
            // @ts-ignore
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
            // @ts-ignore
            const lon = EXIF.getTag(this, 'GPSLongitude');
            // @ts-ignore
            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');

            if (lat && lon && latRef && lonRef) {
              const latitude = convertDMSToDD(lat[0], lat[1], lat[2], latRef);
              const longitude = convertDMSToDD(lon[0], lon[1], lon[2], lonRef);
              
              resolve({
                name: file.name,
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6))
              });
            } else {
              resolve({
                name: file.name,
                latitude: null,
                longitude: null,
                error: 'No GPS data found'
              });
            }
          });
        };
        
        img.onerror = () => {
          resolve({
            name: file.name,
            latitude: null,
            longitude: null,
            error: 'Failed to load image'
          });
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        resolve({
          name: file.name,
          latitude: null,
          longitude: null,
          error: 'Failed to read file'
        });
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const results: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = await extractGPSData(file);
      results.push(data);
    }

    setImageData(results);
    setIsProcessing(false);
    setCurrentPage('results');
  };

  const downloadTextFile = () => {
    let content = 'GPS Coordinates Extraction Results\n';
    content += '=====================================\n\n';

    imageData.forEach((data, index) => {
      content += `Image ${index + 1}: ${data.name}\n`;
      if (data.latitude !== null && data.longitude !== null) {
        content += `Latitude: ${data.latitude}\n`;
        content += `Longitude: ${data.longitude}\n`;
        content += `Google Maps: https://www.google.com/maps?q=${data.latitude},${data.longitude}\n`;
      } else {
        content += `Status: ${data.error || 'No GPS data available'}\n`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gps_coordinates_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetApp = () => {
    setCurrentPage('home');
    setImageData([]);
    setIsProcessing(false);
  };

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Animated Galaxy Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black opacity-80"></div>
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
          {/* Larger stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-blue-200"
              style={{
                width: Math.random() * 4 + 2 + 'px',
                height: Math.random() * 4 + 2 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animation: `pulse ${Math.random() * 3 + 2}s infinite ${Math.random() * 3}s`,
                boxShadow: '0 0 10px rgba(147, 197, 253, 0.8)'
              }}
            />
          ))}
          {/* Nebula effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MapPin className="w-12 h-12 text-blue-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                GeoExtractor
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Extract GPS coordinates from your images and explore where your memories were captured
            </p>
          </div>

          {/* Upload Area */}
          <div className="w-full max-w-2xl">
            <label
              htmlFor="file-upload"
              className="group relative block cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-16 transition-all duration-300 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                
                <div className="relative flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full">
                      <Upload className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold text-white">
                      Upload Your Images
                    </h2>
                    <p className="text-lg text-gray-300">
                      JPG, PNG, or HEIC files
                    </p>
                    <p className="text-sm text-gray-400">
                      Click to browse or drag and drop
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-gray-400">
                    <ImageIcon className="w-5 h-5" />
                    <span>Multiple files supported</span>
                  </div>
                </div>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.heic"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          {isProcessing && (
            <div className="mt-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-300">Processing your images...</p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  // Results Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black opacity-80"></div>
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Extraction Complete
            </h1>
            <p className="text-gray-300">
              Found GPS data in {imageData.filter(d => d.latitude !== null).length} of {imageData.length} images
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4 mb-8">
            {imageData.map((data, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${data.latitude !== null ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {data.latitude !== null ? (
                      <MapPin className="w-6 h-6 text-green-400" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{data.name}</h3>
                    {data.latitude !== null && data.longitude !== null ? (
                      <div className="space-y-1 text-gray-300">
                        <p>📍 Latitude: <span className="text-blue-400 font-mono">{data.latitude}</span></p>
                        <p>📍 Longitude: <span className="text-purple-400 font-mono">{data.longitude}</span></p>
                        <a
                          href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
                        >
                          View on Google Maps →
                        </a>
                      </div>
                    ) : (
                      <p className="text-red-400">{data.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={downloadTextFile}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5" />
                Download Text File
                <FileText className="w-5 h-5" />
              </div>
            </button>
            <button
              onClick={resetApp}
              className="px-8 py-4 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-xl font-semibold text-white transition-all duration-300 hover:bg-gray-700 hover:border-gray-500"
            >
              Upload More Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoExtractor;
