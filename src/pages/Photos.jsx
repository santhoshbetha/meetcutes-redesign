import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

const ID = 'e9657b2174cfd94d867005431c056ae9';
const SECRET = 'fb0d1c76b8cab0a6e196554419a72cd23b5129718d865213cc5a56bb9b30256d';
const BUCKET_NAME = 'localm';

const CDNURL = 'https://gweikvxgqoptvyqiljhp.supabase.co/storage/v1/object/public/localm/images';

//https://www.sammeechward.com/uploading-images-express-and-react
//https://stackoverflow.com/questions/4109276/how-to-detect-input-type-file-change-for-the-same-file
//https://jsitor.com/XdnH239VS

function timeout(delay) {
  return new Promise(res => setTimeout(res, delay));
}

function isObjEmpty(val) {
  return val == null ||
    val.length <= 0 ||
    (Object.keys(val).length === 0 && val.constructor === Object)
    ? true
    : false;
}

export function Photos() {
  const { user, profiledata, setProfiledata } = useAuth();
  const [images, setImages] = useState([]);
  const [numSlots, setNumSlots] = useState(3); // Start with 3 default slots
  const isOnline = useOnlineStatus();
  let [loadingImages, setLoadingImages] = useState(false);
  const [reload, setReload] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [deleting, setDeleting] = useState([]);

  const shortid = profiledata?.shortid;

  // Helper function to get image filename based on index
  const getImageFilename = (index) => {
    const filenames = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
    return filenames[index] || `image${index + 1}`;
  };

  // Helper function to update image at specific index
  const updateImage = (index, value) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = value;
      return newImages;
    });
  };

  // Function to add a new slot
  const addSlot = () => {
    if (numSlots < 10) { // Maximum 10 slots
      setNumSlots(prev => prev + 1);
      setImages(prev => [...prev, null]);
      setUploading(prev => [...prev, false]);
      setDeleting(prev => [...prev, false]);
    } else {
      toast.error('Maximum 10 photo slots allowed', {
        position: 'top-center',
      });
    }
  };

  // Function to remove a slot (only if more than 3 slots and the slot is empty)
  const removeSlot = (index) => {
    if (numSlots > 3 && index >= 3 && isObjEmpty(images[index])) {
      setNumSlots(prev => prev - 1);
      setImages(prev => prev.filter((_, i) => i !== index));
      setUploading(prev => prev.filter((_, i) => i !== index));
      setDeleting(prev => prev.filter((_, i) => i !== index));
    } else if (numSlots <= 3) {
      toast.error('Cannot remove default photo slots', {
        position: 'top-center',
      });
    } else if (!isObjEmpty(images[index])) {
      toast.error('Cannot remove slot with existing photo', {
        position: 'top-center',
      });
    }
  };

  useEffect(() => {
    const loadImages = async () => {
      if (!isObjEmpty(profiledata?.images)) {
        // Load all 10 images
        const newImages = Array(10).fill(null);
        for (let i = 0; i < 10; i++) {
          if (!isObjEmpty(profiledata?.images[i])) {
            newImages[i] = { uri: `${CDNURL}/${shortid}/${profiledata?.images[i]}` };
          }
        }
        setImages(newImages);
        setReload(false);
      }

      // Always set loading to false after a short delay
      timeout(1000).then(() => {
        setLoadingImages(false);
      });
    };

    setLoadingImages(true);
    loadImages();
  }, [isOnline, user, reload, profiledata?.images, shortid]);

  // Generic image crop handler
  const handleImageCropped = async (blob, imageIndex) => {
    if (!isOnline) {
      toast.error('You are offline. Check your internet connection', {
        position: 'top-center',
      });
      return;
    }

    setUploading(prev => prev.map((val, i) => i === imageIndex ? true : val));
    const timestamp = Date.now();
    const filename = getImageFilename(imageIndex);

    try {
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

      const res = await uploadImage(shortid, file, imageIndex + 1, timestamp);

      if (res.success) {
        let imagesObj = profiledata?.images || [];

        if (!isObjEmpty(imagesObj)) {
          let updated = false;
          imagesObj.forEach(function (element, index) {
            if (element.slice(0, filename.length) == filename) {
              imagesObj[index] = `${filename}?t=${timestamp}`;
              updated = true;
            }
          });
          if (!updated) {
            if (imagesObj[imageIndex] == '') {
              imagesObj[imageIndex] = `${filename}?t=${timestamp}`;
            } else {
              imagesObj.push(`${filename}?t=${timestamp}`);
            }
          }
        } else {
          imagesObj = Array(10).fill('');
          imagesObj[imageIndex] = `${filename}?t=${timestamp}`;
        }

        const res2 = await updateUserInfo(user?.id, { images: imagesObj });

        if (res2.success) {
          setProfiledata({
            ...profiledata,
            images: imagesObj,
          });
          updateImage(imageIndex, { uri: `${CDNURL}/${shortid}/${filename}?t=${timestamp}` });
          toast.success(`Photo ${imageIndex + 1} uploaded successfully!`, {
            position: 'top-center',
          });
        } else {
          toast.error(res2.msg || 'Failed to update profile', {
            position: 'top-center',
          });
        }
      } else {
        toast.error(res.msg || 'Failed to upload image', {
          position: 'top-center',
        });
      }
    } catch {
      toast.error('An error occurred while uploading the image', {
        position: 'top-center',
      });
    } finally {
      setUploading(prev => prev.map((val, i) => i === imageIndex ? false : val));
    }
  };

  // Generic image remove handler
  const handleImageRemove = async (imageIndex) => {
    if (!isOnline) {
      toast.error('You are offline. Check your internet connection', {
        position: 'top-center',
      });
      return;
    }

    setDeleting(prev => prev.map((val, i) => i === imageIndex ? true : val));

    try {
      const res = await deleteImage(shortid, imageIndex + 1);

      if (res.success) {
        let imagesObj = profiledata?.images || [];
        let deleteset = false;

        if (!isObjEmpty(imagesObj)) {
          const filename = getImageFilename(imageIndex);
          imagesObj.forEach(function (element, index) {
            if (element.slice(0, filename.length) == filename) {
              imagesObj[index] = '';
              deleteset = true;
            }
          });
          if (deleteset) {
            const res2 = await updateUserInfo(user?.id, { images: imagesObj });
            if (res2.success) {
              setProfiledata({ ...profiledata, images: imagesObj });
              updateImage(imageIndex, null);
              toast.success(`Photo ${imageIndex + 1} removed successfully!`, {
                position: 'top-center',
              });
            } else {
              toast.error(res2.msg || 'Failed to update profile', {
                position: 'top-center',
              });
            }
          }
        }
      } else {
        toast.error(res.msg || 'Failed to delete image', {
          position: 'top-center',
        });
      }
    } catch {
      toast.error('An error occurred while removing the image', {
        position: 'top-center',
      });
    } finally {
      setDeleting(prev => prev.map((val, i) => i === imageIndex ? false : val));
    }
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

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Dynamic Photo Slots */}
                {Array.from({ length: numSlots }, (_, index) => {
                  const isPrimary = index === 0;
                  const isDefault = index < 3;
                  const canRemove = !isDefault && isObjEmpty(images[index]);

                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className={`w-4 h-4 ${isPrimary ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="text-sm font-medium text-foreground">
                            {isPrimary ? 'Profile' : `Photo ${index + 1}`}
                          </span>
                          {isPrimary && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Primary</span>
                          )}
                          {!isPrimary && isDefault && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Default</span>
                          )}
                          {!isPrimary && !isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Extra</span>
                          )}
                        </div>
                        {!isPrimary && !isDefault && canRemove && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlot(index)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        {!isObjEmpty(images[index]) ? (
                          <div className="relative group">
                            <ImageLoader
                              imgSrc={images[index]}
                              onImageRemove={() => handleImageRemove(index)}
                              className={`w-full aspect-square rounded-xl overflow-hidden border-2 ${
                                isPrimary ? 'border-primary/20' : 'border-border'
                              }`}
                            />
                            {deleting[index] && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <Spinner size="small" className="text-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <ImageUploader
                              onImageCropped={(blob) => handleImageCropped(blob, index)}
                              setReload={setReload}
                              className={`w-full aspect-square rounded-xl border-2 border-dashed transition-colors ${
                                isPrimary
                                  ? 'border-primary/50 hover:border-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            />
                            {uploading[index] && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <Spinner size="medium" className="text-white mb-2" />
                                  <p className="text-white text-sm">Uploading...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Slot Button */}
                {numSlots < 10 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Add Slot</span>
                    </div>
                    <div className="relative">
                      <Button
                        onClick={addSlot}
                        variant="outline"
                        className="w-full aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Add Photo</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

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
