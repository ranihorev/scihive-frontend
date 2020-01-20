import axios from 'axios';
import { History } from 'history';
import { toast } from 'react-toastify';
import { FileMetadata } from '../models';
import { track } from '../Tracker';

export const uploadPaperDetails = async (details: FileMetadata, history: History) => {
  try {
    track('uploadPaperMeta');
    const response = await axios.patch('/new_paper/add', details);
    history.push(`/paper/${response.data.paper_id}`);
  } catch (e) {
    console.error(e.response?.data?.message);
    toast.error(`Failed to upload paper details. Please try again - ${e.message}`, {
      autoClose: 3000,
    });
  }
};
