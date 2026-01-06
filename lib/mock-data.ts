// Mock data service for development
import { 
  Exam, 
  Question, 
  QuestionCategory, 
  Partner, 
  User,
  CreateExamRequest,
  UpdateExamRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ApiResponse,
  PaginatedResponse
} from '@/types';

// Mock data
const mockCategories: QuestionCategory[] = [
  {
    id: 1,
    name: 'ریاضیات',
    description: 'مفاهیم و مسائل ریاضی',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'علوم',
    description: 'مفاهیم و نظریه‌های علمی',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'تاریخ',
    description: 'رویدادها و حقایق تاریخی',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockQuestions: Question[] = [
  {
    id: 1,
    text: 'حاصل ۲ + ۲ چیست؟',
    type: 'multiple_choice',
    options: [
      { id: 1, text: '۳', is_correct: false },
      { id: 2, text: '۴', is_correct: true },
      { id: 3, text: '۵', is_correct: false },
      { id: 4, text: '۶', is_correct: false }
    ],
    correct_answer: 2,
    category_id: 1,
    category: mockCategories[0],
    tags: ['پایه', 'حساب'],
    difficulty: 'easy',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    text: 'پایتخت فرانسه چیست؟',
    type: 'multiple_choice',
    options: [
      { id: 5, text: 'لندن', is_correct: false },
      { id: 6, text: 'برلین', is_correct: false },
      { id: 7, text: 'پاریس', is_correct: true },
      { id: 8, text: 'مادرید', is_correct: false }
    ],
    correct_answer: 7,
    category_id: 3,
    category: mockCategories[2],
    tags: ['جغرافیا', 'پایتخت‌ها'],
    difficulty: 'easy',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    text: 'کدام یک از موارد زیر زبان برنامه‌نویسی هستند؟',
    type: 'multiple_select',
    options: [
      { id: 9, text: 'JavaScript', is_correct: true },
      { id: 10, text: 'HTML', is_correct: false },
      { id: 11, text: 'Python', is_correct: true },
      { id: 12, text: 'CSS', is_correct: false }
    ],
    correct_answer: [9, 11],
    category_id: 2,
    category: mockCategories[1],
    tags: ['برنامه‌نویسی', 'فناوری'],
    difficulty: 'medium',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockPartners: Partner[] = [
  {
    id: 1,
    name: 'آکادمی فناوری',
    website_url: 'https://techacademy.com',
    callback_url: 'https://techacademy.com/callback',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'مرکز یادگیری آنلاین',
    website_url: 'https://onlinelearning.com',
    callback_url: 'https://onlinelearning.com/callback',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockUsers: User[] = [
  {
    id: 1,
    name: 'کاربر مدیر',
    phone_number: '09123456789',
    email: 'admin@example.com',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'مدیر محتوا',
    phone_number: '09123456790',
    email: 'content@example.com',
    role: 'content_manager',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockExams: Exam[] = [
  {
    id: 1,
    title: 'آزمون ریاضی پایه',
    description: 'یک آزمون ساده ریاضی برای مبتدیان',
    subject: 'ریاضیات',
    partner_id: 1,
    partner: mockPartners[0],
    questions: [
      {
        id: 1,
        exam_id: 1,
        question_id: 1,
        question: mockQuestions[0],
        order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ],
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create API response
const createApiResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  data,
  message: message || 'موفقیت',
  success: true
});

// Helper function to create paginated response
const createPaginatedResponse = <T>(
  data: T[], 
  page: number = 1, 
  perPage: number = 10
): ApiResponse<PaginatedResponse<T>> => {
  const total = data.length;
  const lastPage = Math.ceil(total / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return createApiResponse({
    data: paginatedData,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total
    }
  });
};

class MockApiClient {
  // Exam endpoints
  async createExam(data: CreateExamRequest): Promise<ApiResponse<Exam>> {
    await delay(500);
    const newExam: Exam = {
      id: mockExams.length + 1,
      title: data.title,
      description: data.description,
      subject: data.subject,
      partner_id: data.partner_id,
      partner: mockPartners.find(p => p.id === data.partner_id),
      questions: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockExams.push(newExam);
    return createApiResponse(newExam, 'آزمون با موفقیت ایجاد شد');
  }

  async getExam(id: number): Promise<ApiResponse<Exam>> {
    await delay(300);
    const exam = mockExams.find(e => e.id === id);
    if (!exam) {
      throw new Error('Exam not found');
    }
    return createApiResponse(exam);
  }

  async updateExam(id: number, data: UpdateExamRequest): Promise<ApiResponse<Exam>> {
    await delay(400);
    const examIndex = mockExams.findIndex(e => e.id === id);
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }
    
    const updatedExam = {
      ...mockExams[examIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    mockExams[examIndex] = updatedExam;
    return createApiResponse(updatedExam, 'آزمون با موفقیت به‌روزرسانی شد');
  }

  async completeExam(id: number): Promise<ApiResponse<{ callback_url: string; pdf_url: string }>> {
    await delay(800);
    const exam = mockExams.find(e => e.id === id);
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    return createApiResponse({
      callback_url: exam.partner?.callback_url || 'https://example.com/callback',
      pdf_url: `https://example.com/exams/${id}/pdf`
    }, 'آزمون با موفقیت تکمیل شد');
  }

  // Question endpoints
  async getQuestions(params?: {
    category_id?: number;
    difficulty?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Question>>> {
    await delay(300);
    
    let filteredQuestions = [...mockQuestions];
    
    if (params?.category_id) {
      filteredQuestions = filteredQuestions.filter(q => q.category_id === params.category_id);
    }
    
    if (params?.difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === params.difficulty);
    }
    
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredQuestions = filteredQuestions.filter(q => 
        q.text.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    const page = params?.page || 1;
    const perPage = params?.per_page || 10;
    
    return createPaginatedResponse(filteredQuestions, page, perPage);
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    await delay(200);
    const question = mockQuestions.find(q => q.id === id);
    if (!question) {
      throw new Error('Question not found');
    }
    return createApiResponse(question);
  }

  async createQuestion(data: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    await delay(500);
    const newQuestion: Question = {
      id: mockQuestions.length + 1,
      text: data.text,
      type: data.type,
      options: data.options.map((opt, index) => ({ ...opt, id: index + 1 })),
      correct_answer: data.correct_answer,
      category_id: data.category_id,
      category: mockCategories.find(c => c.id === data.category_id),
      tags: data.tags,
      difficulty: data.difficulty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockQuestions.push(newQuestion);
    return createApiResponse(newQuestion, 'سوال با موفقیت ایجاد شد');
  }

  async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<ApiResponse<Question>> {
    await delay(400);
    const questionIndex = mockQuestions.findIndex(q => q.id === id);
    if (questionIndex === -1) {
      throw new Error('Question not found');
    }
    
    const updatedQuestion = {
      ...mockQuestions[questionIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    mockQuestions[questionIndex] = updatedQuestion;
    return createApiResponse(updatedQuestion, 'سوال با موفقیت به‌روزرسانی شد');
  }

  async deleteQuestion(id: number): Promise<ApiResponse<void>> {
    await delay(300);
    const questionIndex = mockQuestions.findIndex(q => q.id === id);
    if (questionIndex === -1) {
      throw new Error('Question not found');
    }
    mockQuestions.splice(questionIndex, 1);
    return createApiResponse(undefined, 'سوال با موفقیت حذف شد');
  }

  // Question Category endpoints
  async getCategories(): Promise<ApiResponse<QuestionCategory[]>> {
    await delay(200);
    return createApiResponse(mockCategories);
  }

  async createCategory(data: { name: string; description?: string }): Promise<ApiResponse<QuestionCategory>> {
    await delay(300);
    const newCategory: QuestionCategory = {
      id: mockCategories.length + 1,
      name: data.name,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCategories.push(newCategory);
    return createApiResponse(newCategory, 'دسته‌بندی با موفقیت ایجاد شد');
  }

  // Partner endpoints
  async getPartners(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Partner>>> {
    await delay(300);
    const page = params?.page || 1;
    const perPage = params?.per_page || 15;
    return createPaginatedResponse(mockPartners, page, perPage);
  }

  async getPartner(id: number): Promise<ApiResponse<Partner>> {
    await delay(200);
    const partner = mockPartners.find(p => p.id === id);
    if (!partner) {
      throw new Error('Partner not found');
    }
    return createApiResponse(partner);
  }

  async createPartner(data: {
    name: string;
    website_url?: string | null;
    callback_url: string;
  }): Promise<ApiResponse<Partner>> {
    await delay(500);
    const newPartner: Partner = {
      id: mockPartners.length + 1,
      name: data.name,
      website_url: data.website_url || null,
      callback_url: data.callback_url,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPartners.push(newPartner);
    return createApiResponse(newPartner, 'شریک با موفقیت ایجاد شد');
  }

  async updatePartner(id: number, data: {
    name?: string;
    website_url?: string | null;
    callback_url?: string;
  }): Promise<ApiResponse<Partner>> {
    await delay(400);
    const partnerIndex = mockPartners.findIndex(p => p.id === id);
    if (partnerIndex === -1) {
      throw new Error('Partner not found');
    }
    
    const updatedPartner = {
      ...mockPartners[partnerIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    mockPartners[partnerIndex] = updatedPartner;
    return createApiResponse(updatedPartner, 'شریک با موفقیت به‌روزرسانی شد');
  }

  async togglePartnerActive(id: number): Promise<ApiResponse<Partner>> {
    await delay(300);
    const partnerIndex = mockPartners.findIndex(p => p.id === id);
    if (partnerIndex === -1) {
      throw new Error('Partner not found');
    }
    
    const updatedPartner = {
      ...mockPartners[partnerIndex],
      is_active: !mockPartners[partnerIndex].is_active,
      updated_at: new Date().toISOString()
    };
    mockPartners[partnerIndex] = updatedPartner;
    const status = updatedPartner.is_active ? 'فعال شد' : 'غیرفعال شد';
    return createApiResponse(updatedPartner, `شریک ${status}`);
  }

  // User management endpoints
  async getUsers(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    await delay(300);
    const page = params?.page || 1;
    const perPage = params?.per_page || 15;
    return createPaginatedResponse(mockUsers, page, perPage);
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    await delay(200);
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return createApiResponse(user);
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    await delay(500);
    const newUser: User = {
      id: mockUsers.length + 1,
      name: data.name,
      email: data.email,
      role: (data.role || 'content_manager') as 'admin' | 'content_manager' | 'partner_user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return createApiResponse(newUser, 'کاربر با موفقیت ایجاد شد');
  }

  async updateUser(id: number, data: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    await delay(400);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...mockUsers[userIndex],
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.role && { role: data.role as 'admin' | 'content_manager' | 'partner_user' }),
      updated_at: new Date().toISOString()
    };
    mockUsers[userIndex] = updatedUser;
    return createApiResponse(updatedUser, 'کاربر با موفقیت به‌روزرسانی شد');
  }

  async toggleUserActive(id: number): Promise<ApiResponse<User>> {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...mockUsers[userIndex],
      is_active: !mockUsers[userIndex].is_active,
      updated_at: new Date().toISOString()
    };
    mockUsers[userIndex] = updatedUser;
    const status = updatedUser.is_active ? 'فعال شد' : 'غیرفعال شد';
    return createApiResponse(updatedUser, `کاربر ${status}`);
  }
}

export const mockApiClient = new MockApiClient();
