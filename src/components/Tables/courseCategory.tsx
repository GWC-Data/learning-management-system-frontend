import { Button } from "../../components/ui/button";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import axios from "axios";


// TypeScript types for the component props
interface CourseCategoryTableProps {
  editable?: boolean;
}

// TypeScript types for course category data
interface CourseCategoryData {
  id: number;
  courseCategory: string;
  description: string;
  courseCategoryImg: string;
}

// Column definitions type from AG-Grid
import { ColDef } from "ag-grid-community";

// Helper to get token
const getToken = () => localStorage.getItem("authToken");

const CourseCategoryTable = ({ editable = true }: CourseCategoryTableProps) => {
  const [categoryData, setCategoryData] = useState<CourseCategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colDefs, setColDefs] = useState<ColDef[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newCategory, setNewCategory] = useState<CourseCategoryData>({
    id: 0,
    courseCategory: "",
    description: "",
    courseCategoryImg: "",
  });

  // Fetch course categories
  const fetchCourseCategory = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to view course categories.");
      return;
    }

    try {
      const response = await axios.get(`/getcategory`);
      setCategoryData(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch course categories", error);
      toast.error("Failed to fetch course categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseCategory();
  }, []);

  const addNewRow = () => {
    setEditing(false);
    setNewCategory({
      id: 0,
      courseCategory: "",
      description: "",
      courseCategoryImg: "",
    });
    setIsModalOpen(true);
  };

  const deleteCategory = async (data: any) => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to delete a category.");
      return;
    }

    const categoryId = data.data.id;
    try {
      await axios.delete(`/deletecategory/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategoryData((prev) => prev.filter((category) => category.id !== categoryId));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Failed to delete category", error);
      toast.error("Failed to delete the category. Please try again later.");
    }
  };

  const editCategory = (data: any) => {
    const categoryToEdit = categoryData.find((category) => category.id === data.data.id);
    console.log('categoryToEdit',categoryToEdit);
    if (categoryToEdit) {
      setEditing(true);
      setNewCategory(categoryToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewCategory({
      id: 0,
      courseCategory: "",
      description: "",
      courseCategoryImg: "",
    });
  };

  const handleFormSubmit = async () => {
    const token = getToken();
    if (!token) {
      toast.error("You must be logged in to perform this action.");
      return;
    }
  
    // Logging the current state of newCategory before the request
    console.log("Submitting Category: ", newCategory);
  
    if (editing) {
      // Check if the newCategory.id is correctly set
      if (!newCategory.id) {
        console.error("Category ID is missing for update");
        toast.error("Category ID is missing.");
        return;
      }
  
      try {
        const response = await axios.put(`/updatecategory/${newCategory.id}`, newCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Assuming the backend returns the updated category data
        setCategoryData((prev) =>
          prev.map((category) =>
            category.id === newCategory.id ? response.data : category
          )
        );
        toast.success("Category updated successfully!");
      } catch (error) {
        console.error("Failed to update category", error);
        toast.error("Failed to update the category. Please try again later.");
      }
    } else {
      try {
        const response = await axios.post(`/createcourse-category`, newCategory, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategoryData((prev) => [...prev, response.data]);
        toast.success("Category added successfully!");
      } catch (error) {
        console.error("Failed to add category", error);
        toast.error("Failed to add the category. Please try again later.");
      }
    }
    handleModalClose();
  };
  

  useEffect(() => {
    setColDefs([
      { headerName: "Category Name", field: "courseCategory", editable: true },
      { headerName: "Description", field: "description", editable: true },
      { headerName: "Image Path", field: "courseCategoryImg", editable: true },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params: any) => (
          <div className="flex space-x-2">
            <Button
              onClick={() => editCategory(params)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => deleteCategory(params)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        ),
        editable: false,
      },
    ]);
  }, [categoryData]);

  return (
    <div className="flex-1 p-4 mt-10 ml-10">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6 w-[850px]">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold tracking-wide">Course Categories</h2>
          <p className="text-sm font-light">Manage course categories easily.</p>
        </div>
        <Button
          onClick={addNewRow}
          className="bg-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-md shadow-lg hover:bg-yellow-500 transition duration-300"
        >
          + New Category
        </Button>
      </div>

      <div className="ag-theme-quartz text-left" style={{ height: "calc(100vh - 180px)", width: "68%" }}>
        <AgGridReact
          rowSelection="multiple"
          suppressRowClickSelection
          suppressMovableColumns
          loading={loading}
          columnDefs={colDefs}
          rowData={categoryData}
          defaultColDef={{ editable, sortable: true, filter: true, resizable: true }}
          animateRows
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit Category" : "Add New Category"}</h2>
            <form>
              <div className="mb-4">
                <label className="block font-medium">Category Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newCategory.courseCategory}
                  onChange={(e) => setNewCategory({ ...newCategory, courseCategory: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Description</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Image Path</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={newCategory.courseCategoryImg}
                  onChange={(e) => setNewCategory({ ...newCategory, courseCategoryImg: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleModalClose}
                  className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCategoryTable;
