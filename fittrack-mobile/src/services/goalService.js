import apiRequest from './api';

const goalService = {
  // Get all goals for logged-in user
  getMyGoals: async () => {
    try {
      const response = await apiRequest('/goals/my-goals', 'GET');
      return response;
    } catch (error) {
      console.error('Get my goals error:', error);
      throw error;
    }
  },

  // Get single goal by ID
  getGoalById: async (goalId) => {
    try {
      const response = await apiRequest(`/goals/${goalId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Get goal by ID error:', error);
      throw error;
    }
  },

  // Create new goal
  createGoal: async (goalData) => {
    try {
      const response = await apiRequest('/goals', 'POST', goalData);
      return response;
    } catch (error) {
      console.error('Create goal error:', error);
      throw error;
    }
  },

  // Update goal
  updateGoal: async (goalId, goalData) => {
    try {
      const response = await apiRequest(`/goals/${goalId}`, 'PUT', goalData);
      return response;
    } catch (error) {
      console.error('Update goal error:', error);
      throw error;
    }
  },

  // Delete goal
  deleteGoal: async (goalId) => {
    try {
      const response = await apiRequest(`/goals/${goalId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Delete goal error:', error);
      throw error;
    }
  },

  // Update goal status (Achieved/Failed)
  updateStatus: async (goalId, status) => {
    try {
      const response = await apiRequest(`/goals/${goalId}/status`, 'PATCH', { status });
      return response;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  // Update current progress value
  updateProgress: async (goalId, currentValue) => {
    try {
      const response = await apiRequest(`/goals/${goalId}/progress`, 'PATCH', { currentValue });
      return response;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  },
};

export default goalService;