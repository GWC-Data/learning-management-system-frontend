import React, { useEffect, useState } from "react";
import {
  fetchUsersbyIdApi,
  updateTraineeUserApi,
} from "../../../helpers/api/userApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CameraIcon from "../../../icons/photo-camera.png";

interface FormErrors {
  [key: string]: string;
}

const ProfileSettings: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profilePicChanged, setProfilePicChanged] = useState<boolean>(false);

  const navigate = useNavigate();

  // Check auth status before component mounts
  useEffect(() => {
    console.log("ProfileSettings component mounted");

    const storedAuthStatus = localStorage.getItem("isAuthenticated");
    console.log("Auth status from localStorage:", storedAuthStatus);

    if (storedAuthStatus !== "true") {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Fetch user data
    const fetchUser = async () => {
      console.log("Fetching user data");
      setIsLoading(true);

      const userIdString = localStorage.getItem("userId");
      console.log("User ID from localStorage:", userIdString);

      if (!userIdString) {
        console.error("User ID not found in local storage");
        setError("User ID not found in local storage.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Calling fetchUsersbyIdApi with ID:", userIdString);
        const user = await fetchUsersbyIdApi(userIdString);
        console.log("Fetched user data:", user);

        if (!user) {
          throw new Error("No user data returned from API");
        }

        setUserData(user);
        setOriginalData(user);

        // Set image preview if profile pic exists
        if (user.profilePic) {
          setImagePreview(user.profilePic);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          `Failed to load user data: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]); // Only re-run if navigate changes

  // Cleanup effect for image preview URL
  useEffect(() => {
    return () => {
      // Cleanup function for the image preview URL
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Clean up previous preview URL if it was created with createObjectURL
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      console.log('ProfilePic', file);

      setProfilePic(file);
      setProfilePicChanged(true); // Set flag when profile picture is changed

      // Create a temporary URL for image preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      console.log("File selected:", file.name, file.type, file.size);
    } catch (err) {
      console.error("Error processing file:", err);
      toast.error("Failed to process the uploaded image");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Clear the error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    setUserData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    // Basic validation
    if (!userData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!userData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    // Phone number validation (basic)
    if (userData.phoneNumber && !/^\d{10}$/.test(userData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    return errors;
  };

  const formatDate = (dateInput: any): string => {
    if (!dateInput) return "";

    try {
      // Handle BigQueryDate objects that have a value property
      const dateString =
        typeof dateInput === "object" && dateInput.value
          ? dateInput.value
          : String(dateInput);

      // Parse the date string
      const date = new Date(dateString);

      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        console.warn("Invalid date input:", dateInput);
        return "";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (err) {
      console.error("Error formatting date:", err, dateInput);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      toast.error("No user data to update");
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Preparing to update user with ID:", userData.id);

      // Create FormData object
      const formData = new FormData();

      // List of fields to include in the update
      const textFields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "address",
        "qualification",
      ];

      // Add text fields to FormData
      textFields.forEach((field) => {
        formData.append(field, userData[field] || "");
      });

      // Handle date of birth specifically
      if (userData.dateOfBirth) {
        const dobValue = formatDate(userData.dateOfBirth);
        formData.append("dateOfBirth", dobValue);
      }

      // Only append profilePic if a new file has been selected
      if (profilePic && profilePicChanged) {
        console.log("Appending profilePic to FormData:", profilePic);
        formData.append("profilePic", profilePic);
        
        // Add a flag to indicate profile picture was changed
        formData.append("profilePicChanged", "true");
      }

      console.log("FormData before sending:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Set proper headers for multipart/form-data
      const headers = {
        // Do not set Content-Type header manually for FormData
        // The browser will automatically set the correct boundary
      };

      // Send the update request
      await updateTraineeUserApi(userData.id, formData);

      toast.success("Profile updated successfully!");
      setIsEditMode(false);
      setProfilePicChanged(false);

      // Refresh user data
      const updatedUser = await fetchUsersbyIdApi(userData.id);
      setUserData(updatedUser);
      setOriginalData(updatedUser);

      if (updatedUser.profilePic) {
        // Clean up previous preview URL if it was created with createObjectURL
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        
        // Force browser to reload the image by adding a timestamp parameter
        const timestamp = new Date().getTime();
        const cachedImageUrl = `${updatedUser.profilePic}?t=${timestamp}`;
        setImagePreview(cachedImageUrl);
      }

      setProfilePic(null);
    } catch (err) {
      console.error("Error updating user data:", err);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setUserData(originalData);
    setFormErrors({});
    setProfilePicChanged(false);

    // Reset image preview to original
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(originalData?.profilePic || null);
    setProfilePic(null);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading profile data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="text-center p-8">No user data available.</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-7xl mx-auto mt-20 mb-20 font-metropolis">
      <div className="bg-gradient-to-r from-[#6E2B8B] to-[#9A5EB5] p-16 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-white">
          Profile Settings
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        encType="multipart/form-data"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 mt-10 mb-10">
          <div className="w-[150px] h-[150px] mx-auto md:mx-0">
            <div className="w-full h-full max-w-[150px] max-h-[150px] bg-[#84c6e9] rounded-full relative">
              <div
                className={`w-full h-full rounded-full ${imagePreview ? "bg-cover bg-center" : "bg-[#6eafd4]"}`}
                style={{
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : "none",
                }}
              >
                <div className="bg-white w-[50px] h-[50px] rounded-full absolute bottom-0 right-0 hover:bg-gray-300 border-2 border-black shadow-sm">
                  <input
                    className="opacity-0 w-[50px] h-[50px] absolute z-10 cursor-pointer"
                    type="file"
                    name="profilePic"
                    id="profilePic"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    disabled={!isEditMode}
                  />
                  <label
                    htmlFor="profilePic"
                    className="text-center text-white w-[50px] h-[50px] flex justify-center items-center cursor-pointer"
                  >
                    <img
                      src={CameraIcon}
                      alt="Upload Icon"
                      className="w-7 h-7"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* User Details Section */}
          <div className="flex flex-col justify-center -ml-0 md:-ml-[150px] mt-6 md:mt-2">
            <h1 className="text-lg font-semibold">{`${userData.firstName || ""} ${userData.lastName || ""}`}</h1>
            <h2 className="text-sm text-gray-600">{userData.email || ""}</h2>
            <h3 className="text-sm text-gray-500">ID: {userData.id || ""}</h3>
            <div className="flex justify-center md:justify-start mt-4">
              {isEditMode ? (
                <div>
                  <button
                    type="submit"
                    className="bg-[#6E2B8B] text-white p-3 rounded-lg disabled:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="ml-4 border border-gray-300 p-3 rounded-lg"
                    disabled={isSubmitting}
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
          </div>
        </div>

        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={userData?.firstName || ""}
              onChange={handleChange}
              disabled={!isEditMode || isSubmitting}
              className={`mt-1 block w-full p-3 border ${
                formErrors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {formErrors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.firstName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userData?.lastName || ""}
              onChange={handleChange}
              disabled={!isEditMode || isSubmitting}
              className={`mt-1 block w-full p-3 border ${
                formErrors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {formErrors.lastName && (
              <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formatDate(userData?.dateOfBirth || "")}
              onChange={handleChange}
              disabled={!isEditMode || isSubmitting}
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
              disabled={!isEditMode || isSubmitting}
              className={`mt-1 block w-full p-3 border ${
                formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
            {formErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Date of Joining</label>
            <input
              type="date"
              name="dateOfJoining"
              value={formatDate(userData?.dateOfJoining || "")}
              onChange={handleChange}
              disabled={true}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
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
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>

        {/* Fourth Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={userData?.qualification || ""}
              onChange={handleChange}
              disabled={!isEditMode || isSubmitting}
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
              disabled={!isEditMode || isSubmitting}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;