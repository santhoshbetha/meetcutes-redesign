import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { uploadImage, deleteImage } from '@/services/image.service';
import { useAuth } from '@/context/AuthContext';
import { updateUserInfo } from '../services/user.service';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageLoader } from '@/components/ImageLoader';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';
import {
  Camera,
  ImageIcon,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plus, Grid3X3, Loader2 } from 'lucide-react';

const CDNURL = 'https://yrxymkmmfrkrfccmutvr.supabase.co/storage/v1/object/public/meetfirst/images';

//https://www.sammeechward.com/uploading-images-express-and-react
//https://stackoverflow.com/questions/4109276/how-to-detect-input-type-file-change-for-the-same-file
//https://jsitor.com/XdnH239VS

function timeout(delay) {
  return new Promise(res => setTimeout(res, delay));
}

const IMAGE_NAMES = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

function isObjEmpty(val) {
  return val == null ||
    val.length <= 0 ||
    (Object.keys(val).length === 0 && val.constructor === Object)
    ? true
    : false;
}

export function Photos() {
  const { user, profiledata, setProfiledata } = useAuth();
  const [images, setImages] = useState(Array(10).fill(null));
  const [numSlots, setNumSlots] = useState(3); // Start with 3 default slots
  const isOnline = useOnlineStatus();
  let [loadingImages, setLoadingImages] = useState(false);
  const [reload, setReload] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [deleting, setDeleting] = useState([]);
  
  const [uploadingSlots, setUploadingSlots] = useState(Array(10).fill(false)); // Track uploading state for each slot
  const [removingSlots, setRemovingSlots] = useState(Array(10).fill(false)); // Track removing state for each slot
  const [removingEmptySlots, setRemovingEmptySlots] = useState(Array(10).fill(false)); // Track removing empty slots state
  const [visibleSlots, setVisibleSlots] = useState(() => {
    const stored = localStorage.getItem('visibleSlots');
    return stored ? parseInt(stored, 10) : 3;
  }); // Start with 3 slots or from localStorage

  const userid = profiledata?.userid;

  useEffect(() => {
    const loadImages = async () => {
      if (!isObjEmpty(profiledata?.images)) {
        const newImages = Array(10).fill(null);
        let maxIndexWithImage = -1;

        profiledata.images.forEach((imageName, index) => {
          if (imageName && index < 10) {
            newImages[index] = { uri: `${CDNURL}/${userid}/${imageName}` };
            maxIndexWithImage = Math.max(maxIndexWithImage, index);
          }
        });

        setImages(newImages);

        // Calculate required slots based on images
        const requiredSlots = Math.max(3, maxIndexWithImage + 1);

        // If visibleSlots is less than required, update it
        if (visibleSlots < requiredSlots) {
          const newVisibleSlots = requiredSlots;
          setVisibleSlots(newVisibleSlots);
          localStorage.setItem('visibleSlots', newVisibleSlots.toString());
        }

        setReload(false);
      } else {
        // No images, ensure minimum 3 slots
        if (visibleSlots < 3) {
          setVisibleSlots(3);
          localStorage.setItem('visibleSlots', '3');
        }
      }
    };

    loadImages();
  }, [isOnline, user, reload, profiledata?.images, userid]);

  const handleImageCropped = async (blob, imageIndex) => {
    // Set uploading state
    setUploadingSlots(prev => {
      const newState = [...prev];
      newState[imageIndex] = true;
      return newState;
    });

    const timestamp = Date.now();
    const imageName = IMAGE_NAMES[imageIndex];
    const imageId = imageIndex + 1;

    //console.log('uploadImage timestamp::', timestamp);

    // Create a file from the blob
    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

    // Upload to server
    const res = await uploadImage(userid, file, imageId, timestamp);
    //console.log('uploadImage res::', res);

    let imagesObj = profiledata?.images ? [...profiledata.images] : [];

    // Ensure array has enough slots
    while (imagesObj.length < imageIndex + 1) {
      imagesObj.push('');
    }

    // Update the specific image slot
    imagesObj[imageIndex] = `${imageName}?t=${timestamp}`;

    // If uploading to a slot beyond current visibleSlots, increase visibleSlots
    let newVisibleSlots = visibleSlots;
    if (imageIndex >= visibleSlots) {
      newVisibleSlots = Math.min(imageIndex + 1, 10);
      setVisibleSlots(newVisibleSlots);
      localStorage.setItem('visibleSlots', newVisibleSlots.toString());
    }

    const updateData = { images: imagesObj };

    const res2 = await updateUserInfo(user?.id, updateData);

    if (res2.success) {
      setProfiledata({
        ...profiledata,
        images: imagesObj,
      });

      // Update local state
      const newImages = [...images];
      newImages[imageIndex] = { uri: `${CDNURL}/${userid}/${imagesObj[imageIndex]}` };
      setImages(newImages);
      if (newVisibleSlots !== visibleSlots) {
        setVisibleSlots(newVisibleSlots);
      }
    } else {
      alert('Upload Image Error.. try again later');
    }

    // Clear uploading state
    setUploadingSlots(prev => {
      const newState = [...prev];
      newState[imageIndex] = false;
      return newState;
    });
  };

  const handleImageRemove = async (imageIndex) => {
    // Set removing state
    setRemovingSlots(prev => {
      const newState = [...prev];
      newState[imageIndex] = true;
      return newState;
    });

    const imageId = imageIndex + 1;
    const res = await deleteImage(userid, imageId);
    //console.log(`handleImageRemove${imageIndex + 1} res::`, res);

    let imagesObj = profiledata?.images ? [...profiledata.images] : [];

    if (!isObjEmpty(imagesObj) && imagesObj[imageIndex]) {
      imagesObj[imageIndex] = '';
      const res = await updateUserInfo(user?.id, { images: imagesObj });
      if (res.success) {
        setProfiledata({ ...profiledata, images: imagesObj });

        // Update local state
        const newImages = [...images];
        newImages[imageIndex] = null;
        setImages(newImages);
      }
    }

    // Clear removing state
    setRemovingSlots(prev => {
      const newState = [...prev];
      newState[imageIndex] = false;
      return newState;
    });
  };

  const handleAddMoreSlots = async () => {
    // Add 1 more slot, but don't exceed 10 total
    const newVisibleSlots = Math.min(visibleSlots + 1, 10);
    setVisibleSlots(newVisibleSlots);
    localStorage.setItem('visibleSlots', newVisibleSlots.toString());
  };

  const handleRemoveEmptySlot = async (slotIndex) => {
    // Set removing empty slot state
    setRemovingEmptySlots(prev => {
      const newState = [...prev];
      newState[slotIndex] = true;
      return newState;
    });

    // Shift images left from slotIndex onwards to fill the gap
    let imagesObj = profiledata?.images ? [...profiledata.images] : [];

    // Shift images left from slotIndex onwards
    for (let i = slotIndex; i < 9; i++) {
      imagesObj[i] = imagesObj[i + 1] || '';
    }
    imagesObj[9] = ''; // Ensure the last slot is empty

    // Calculate new visibleSlots - decrease by 1, minimum 3
    const newVisibleSlots = Math.max(visibleSlots - 1, 3);

    const updateData = { images: imagesObj };

    const res = await updateUserInfo(user?.id, updateData);
    if (res.success) {
      setProfiledata({ ...profiledata, images: imagesObj });

      // Update local images state
      const newImages = Array(10).fill(null);
      for (let i = 0; i < 10; i++) {
        if (imagesObj[i]) {
          newImages[i] = { uri: `${CDNURL}/${userid}/${imagesObj[i]}` };
        }
      }
      setImages(newImages);
      setVisibleSlots(newVisibleSlots);
      localStorage.setItem('visibleSlots', newVisibleSlots.toString());
    } else {
      alert(`Failed to remove empty slot: ${res.msg || 'Unknown error'}. Please try again.`);
    }

    // Clear removing empty slot state
    setRemovingEmptySlots(prev => {
      const newState = [...prev];
      newState[slotIndex] = false;
      return newState;
    });
  };

  const getDisplayedSlots = () => {
    // Always show exactly visibleSlots number of slots
    return visibleSlots;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      {loadingImages && (
        <Spinner
          className="top-[50%] left-[50%] z-50 absolute"
          size="medium"
          withText={true}
          text="Loading photos..."
        />
      )}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
          <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-primary/10 px-6 py-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-primary">Photos</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Upload and manage your profile photos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Profile Photos</h3>
                <p className="text-sm text-muted-foreground">
                  Upload photos to showcase your personality and interests. Start with 3 default slots and add more as needed.
                </p>
              </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-6 place-items-center">
              {images.slice(0, getDisplayedSlots()).map((image, index) => (
                <div key={index} className="relative group w-full max-w-64 sm:max-w-48">
                  {/* Photo Number Badge */}
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge
                      variant={image ? "default" : "secondary"}
                      className={`text-xs font-bold ${
                        image
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                  </div>

                  {/* Image Container */}
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-100 hover:border-blue-300 w-full">
                    {image ? (
                      <div className="w-full h-full relative">
                        <img
                          src={image.uri}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <Button
                          onClick={() => handleImageRemove(index)}
                          className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          variant="destructive"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {removingSlots[index] && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-300 rounded-xl overflow-hidden relative">
                        <ImageUploader
                          onImageCropped={(blob) => handleImageCropped(blob, index)}
                          setReload={setReload}
                          minimal={true}
                          className="w-full h-full"
                        />
                        {uploadingSlots[index] && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        )}
                        {removingEmptySlots[index] && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove Empty Slot Button */}
                  {!image && visibleSlots > 3 && index >= 3 && (
                    <div className="absolute -top-2 -right-2 z-20">
                      <Button
                        onClick={() => handleRemoveEmptySlot(index)}
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Photos Button */}
            {visibleSlots < 10 && (
              <div className="flex justify-center mb-8">
                <Button
                  onClick={handleAddMoreSlots}
                  variant="outline"
                  size="lg"
                  className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-gray-500 text-gray-200 hover:text-white font-medium px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Photo Slot
                  <Grid3X3 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}


              <Separator className="my-8" />

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-foreground">Photo Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use clear, high-quality photos</li>
                      <li>• Show your face clearly in your profile photo</li>
                      <li>• Include photos that represent your interests and personality</li>
                      <li>• Avoid group photos as your primary image</li>
                      <li>• Add more photo slots as needed (up to 10 total)</li>
                      <li>• Remove empty extra slots to keep your profile organized</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Photos;