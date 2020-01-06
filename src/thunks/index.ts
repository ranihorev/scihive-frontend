import axios from 'axios';
import { toast } from 'react-toastify';
import { FileMetadata } from '../models';
import { track } from '../Tracker';

export const uploadPaperDetails = async (details: FileMetadata, onSuccess: (paperId: string) => void) => {
  try {
    track('uploadPaperMeta');
    const response = await axios.patch('/new_paper/add', details);
    onSuccess(response.data.paper_id);
  } catch (e) {
    console.error(e.response?.data?.message);
    toast.error(`Failed to upload paper details. Please try again - ${e.message}`, {
      autoClose: 3000,
    });
  }
};
