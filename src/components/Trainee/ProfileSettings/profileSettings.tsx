
import React, { useEffect, useState } from "react";
import { fetchUsersbyIdApi, updateUserApi } from "../../../helpers/api/userApi"; // Import API functions
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CameraIcon from "../../../icons/photo-camera.png";

const ProfileSettings: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<any>({ courseCategoryImg: "" }); // For new category image

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const storedAuthStatus = localStorage.getItem("isAuthenticated");
      if (storedAuthStatus !== "true") {
        navigate("/login");
        return false;
      }
      return true;
    };

    if (!checkAuthStatus()) {
      return;
    }

    const fetchUser = async () => {
      const userIdString = localStorage.getItem("userId");
      if (!userIdString) {
        setError("User ID not found in local storage.");
        setIsLoading(false);
        return;
      }

      const userId = String(userIdString);
      if (!userId) {
        setError("Invalid User ID in local storage.");
        setIsLoading(false);
        return;
      }

      try {
        const user = await fetchUsersbyIdApi(userId);
        setUserData(user);
        setOriginalData(user);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const convertFileToBase64 = (file: File) => {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string); // Resolve with base64 string
      reader.onerror = reject; // Reject in case of error
      reader.readAsDataURL(file); // This converts the file to base64 with prefix
    });
  };

  // Handle file input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setUploadedFile(file);

      // Convert the file to base64 with prefix
      convertFileToBase64(file).then((base64) => {
        setNewCategory({ ...newCategory, courseCategoryImg: base64 }); // Store base64 string in state
        setImagePreview(base64); // Update the image preview
        // Update userData with the new profile picture
        setUserData((prevData: any) => ({
          ...prevData,
          profilePic: base64, // Assuming `profilePic` is the key for the image
        }));
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (userData) {
        await updateUserApi(userData.id, userData);
        toast("Your profile details have been updated successfully!");
        setIsEditMode(false);
      }
    } catch (err) {
      console.error("Error updating user data:", err);
      toast("There was an issue updating your profile. Please try again");
      setError("Failed to update user data.");
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setUserData(originalData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-[1400px] mt-20 mb-20 font-metropolis ml-[140px]">
      <div className="bg-gradient-to-r from-[#6E2B8B] to-[#9A5EB5] p-16 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-white">Profile Settings</h2>
      </div>

      <div className="grid grid-cols-2 mt-10 mb-10">
        <div className="w-[150px] h-[150px]">
          <div className="w-full h-full max-w-[150px] max-h-[150px] bg-[#84c6e9] rounded-full relative">
            <div
              className={`w-full h-full rounded-full ${imagePreview || userData?.profilePic ? "bg-cover bg-center" : "bg-[#6eafd4]"}`}
              style={{
                backgroundImage: `url(${imagePreview || userData?.profilePic})`,
              }}
            >
              <div
                className="bg-white w-[50px] h-[50px] rounded-full absolute bottom-0 right-0 hover:bg-gray-300 border-2 border-black shadow-sm"
              >
                <input
                  className="opacity-0 w-[50px] h-[50px] absolute z-10"
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  onChange={handleFileChange} // Handle file selection
                  disabled={!isEditMode} // Disable the file input unless in edit mode
                />
                <label className="text-center text-white w-[50px] h-[50px] flex justify-center items-center cursor-pointer">
                  <img src={CameraIcon} alt="Upload Icon" className="w-7 h-7" />
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* User Details Section */}
        <div className="flex flex-col justify-center -ml-[450px]">
          <h1 className="text-lg font-semibold">{`${userData.firstName} ${userData.lastName}`}</h1>
          <h2 className="text-sm text-gray-600">{userData.email}</h2>
          <h3 className="text-sm text-gray-500">ID: {userData.id}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={userData?.firstName || ""}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userData?.lastName || ""}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formatDate(userData?.dateOfBirth || "")}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={userData?.phoneNumber || ""}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Date of Joining</label>
            <input
              type="date"
              name="date of joining"
              value={formatDate(userData?.dateOfJoining || "")}
              onChange={handleChange}
              disabled={true}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Account Status</label>
            <input
              type="text"
              name="accountStatus"
              value={userData?.accountStatus || ""}
              onChange={handleChange}
              disabled={true}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Four Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={userData?.qualification || ""}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={userData?.address || ""}
              onChange={handleChange}
              disabled={!isEditMode}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-between">
          {isEditMode ? (
            <div>
              <button
                type="submit"
                className="bg-[#6E2B8B] text-white p-3 rounded-lg"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="ml-4 text-gray-500 p-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className="bg-[#6E2B8B] text-white p-3 rounded-lg"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
