import React, { useState } from 'react';
import { Upload, Download, MapPin, Image as ImageIcon, FileText, ExternalLink, AlertCircle, Map as MapIconLucide, ArrowLeft } from 'lucide-react';
import * as exifr from 'exifr';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

interface ImageData {
  name: string;
  latitude: number | null;
  longitude: number | null;
  error?: string;
}

const GeoExtractor: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'results' | 'map'>('home');
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopupWarning, setShowPopupWarning] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const extractGPSData = async (file: File): Promise<ImageData> => {
    try {
      console.log(`Processing ${file.name}...`);
      
      const gpsData = await exifr.gps(file);
      
      console.log(`GPS data for ${file.name}:`, gpsData);

      if (gpsData && gpsData.latitude !== undefined && gpsData.longitude !== undefined) {
        return {
          name: file.name,
          latitude: parseFloat(gpsData.latitude.toFixed(6)),
          longitude: parseFloat(gpsData.longitude.toFixed(6))
        };
      } else {
        return {
          name: file.name,
          latitude: null,
          longitude: null,
          error: 'No GPS data found. Make sure Location Services were enabled when photo was taken.'
        };
      }
    } catch (error: any) {
      console.error('Error processing file:', error);
      return {
        name: file.name,
        latitude: null,
        longitude: null,
        error: `Error reading file: ${error.message || 'Unknown error'}`
      };
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const results: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing ${i + 1}/${files.length}: ${file.name}...`);
      
      const data = await extractGPSData(file);
      console.log(`Result for ${file.name}:`, data);
      results.push(data);
    }

    console.log('All results:', results);
    setImageData(results);
    setIsProcessing(false);
    setCurrentPage('results');
  };

  const proceedWithOpeningMaps = () => {
    setShowPopupWarning(false);
    setPopupBlocked(false);
    
    const imagesWithGPS = imageData.filter(data => data.latitude !== null && data.longitude !== null);

    const firstUrl = `https://www.google.com/maps?q=${imagesWithGPS[0].latitude},${imagesWithGPS[0].longitude}`;
    const firstWindow = window.open(firstUrl, '_blank');

    if (!firstWindow || firstWindow.closed || typeof firstWindow.closed === 'undefined') {
      setPopupBlocked(true);
      return;
    }

    for (let i = 1; i < imagesWithGPS.length; i++) {
      setTimeout(() => {
        const url = `https://www.google.com/maps?q=${imagesWithGPS[i].latitude},${imagesWithGPS[i].longitude}`;
        window.open(url, '_blank');
      }, i * 500);
    }
  };

  const openAllInMaps = () => {
    const imagesWithGPS = imageData.filter(data => data.latitude !== null && data.longitude !== null);
    
    if (imagesWithGPS.length === 0) {
      alert('No images with GPS data to open!');
      return;
    }

    if (imagesWithGPS.length > 1) {
      setShowPopupWarning(true);
    } else {
      const url = `https://www.google.com/maps?q=${imagesWithGPS[0].latitude},${imagesWithGPS[0].longitude}`;
      window.open(url, '_blank');
    }
  };

  const showMapView = () => {
    const imagesWithGPS = imageData.filter(data => data.latitude !== null && data.longitude !== null);
    
    if (imagesWithGPS.length === 0) {
      alert('No images with GPS data to display on map!');
      return;
    }

    setCurrentPage('map');
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
    setSelectedMarker(null);
  };

  // Custom Popup Warning Modal
  const PopupWarningModal = () => {
    const imagesWithGPS = imageData.filter(data => data.latitude !== null && data.longitude !== null);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="relative max-w-md w-full bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/30 animate-scaleIn">
          <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `twinkle ${Math.random() * 3 + 2}s infinite`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            {!popupBlocked ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Ready to Explore?
                </h2>

                <p className="text-gray-200 text-center mb-6">
                  About to open <span className="text-purple-400 font-bold">{imagesWithGPS.length} locations</span> in Google Maps
                </p>

                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-blue-300 mb-2">If popups are blocked:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Look for the popup blocker icon in your address bar</li>
                        <li>Click it and select "Always allow"</li>
                        <li>Click the button again</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPopupWarning(false)}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl font-semibold text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedWithOpeningMaps}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg shadow-green-500/30"
                  >
                    Let's Go! 🚀
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-full">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Popups Blocked
                </h2>

                <p className="text-gray-200 text-center mb-6">
                  Your browser blocked the popups. Please allow them to continue.
                </p>

                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-300 space-y-2">
                    <p className="font-semibold text-red-300 mb-3">How to enable popups:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">1.</span>
                        <span>Look for the popup blocker icon in your browser's address bar (usually at the right side)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">2.</span>
                        <span>Click it and select "Always allow popups from this site"</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">3.</span>
                        <span>Click "Let's Go!" again below</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPopupWarning(false);
                      setPopupBlocked(false);
                    }}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl font-semibold text-white transition-all duration-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={proceedWithOpeningMaps}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg shadow-green-500/30"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  };

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

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

          <div className="w-full max-w-2xl">
            <label
              htmlFor="file-upload"
              className="group relative block cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-16 transition-all duration-300 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
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
                      JPG, PNG, HEIC, or HEIF files
                    </p>
                    <p className="text-sm text-gray-400">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-green-400 mt-2">
                      ✨ Supports picture files with GPS data!
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
              accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
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

  if (currentPage === 'map') {
    console.log('MAP KEY:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

    console.log('MAP KEY:', apiKey);
    console.log('MAP ID:', mapId);

    if (!apiKey || !mapId) {
      return (
        <div className="min-h-screen bg-black text-white p-6">
          Missing env vars:
          <pre className="mt-2 text-sm">
            VITE_GOOGLE_MAPS_API_KEY = {String(!!apiKey)}
            {'\n'}
            VITE_GOOGLE_MAPS_MAP_ID  = {String(!!mapId)}
          </pre>
        </div>
      );
    }
    const imagesWithGPS = imageData.filter(data => data.latitude !== null && data.longitude !== null);
    
    // Calculate center and zoom based on markers
    const centerLat = imagesWithGPS.reduce((sum, img) => sum + (img.latitude || 0), 0) / imagesWithGPS.length;
    const centerLng = imagesWithGPS.reduce((sum, img) => sum + (img.longitude || 0), 0) / imagesWithGPS.length;
    
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black opacity-80"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-md border-b border-purple-500/30">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage('results')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <MapIconLucide className="w-8 h-8 text-blue-400" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Map View
                  </h1>
                </div>
              </div>
              <div className="text-gray-300">
                {imagesWithGPS.length} location{imagesWithGPS.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 p-4">
            <div className="h-full rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
              <APIProvider apiKey={(import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''}>
                <Map
                  defaultCenter={{ lat: centerLat, lng: centerLng }}
                  defaultZoom={imagesWithGPS.length === 1 ? 15 : 10}
                  mapId={mapId}
                  style={{ width: '100%', height: '100%' }}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {imagesWithGPS.map((image, index) => (
                    <AdvancedMarker
                      key={index}
                      position={{ lat: image.latitude!, lng: image.longitude! }}
                      onClick={() => setSelectedMarker(index)}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-75 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </AdvancedMarker>
                  ))}

                  {selectedMarker !== null && (
                    <InfoWindow
                      position={{
                        lat: imagesWithGPS[selectedMarker].latitude!,
                        lng: imagesWithGPS[selectedMarker].longitude!
                      }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="p-3 min-w-[200px]">
                        <h3 className="font-bold text-gray-900 mb-2">{imagesWithGPS[selectedMarker].name}</h3>
                        <p className="text-sm text-gray-700 mb-1">
                          📍 {imagesWithGPS[selectedMarker].latitude}, {imagesWithGPS[selectedMarker].longitude}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${imagesWithGPS[selectedMarker].latitude},${imagesWithGPS[selectedMarker].longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-black">
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
                            View on Google Maps
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button
                onClick={showMapView}
                className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <MapIconLucide className="w-5 h-5" />
                  See All Files on Map
                </div>
              </button>
              <button
                onClick={openAllInMaps}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5" />
                  Open All in Google Maps
                  <MapPin className="w-5 h-5" />
                </div>
              </button>
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

      {showPopupWarning && <PopupWarningModal />}
    </>
  );
};

export default GeoExtractor;