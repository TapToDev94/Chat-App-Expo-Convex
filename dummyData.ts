import { faker } from "@faker-js/faker";
import { Story } from "./components/stories";

export const NoImage =
  "https://archive.org/download/placeholder-image/placeholder-image.jpg";

export interface ChatData {
  _id: string;
  name: string;
  image: string | null;
  lastMessage: {
    text?: string;
    createdAt: number;
    media?: {
      type: string;
      fileName?: string;
    }[];
  } | null;
  unreadCount: number;
  isGroup: boolean;
}

export const chatData: ChatData[] = [
  {
    _id: "1",
    name: "Emma Johnson",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Hey, are we still meeting tomorrow?",
      createdAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    },
    unreadCount: 100,
    isGroup: false,
  },
  {
    _id: "2",
    name: "Liam Smith",
    image: faker.image.avatar(),
    lastMessage: {
      text: "I sent you the files you requested",
      createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
    unreadCount: 0,
    isGroup: false,
  },
  {
    _id: "3",
    name: "Olivia Davis",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Thanks for your help yesterday!",
      createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    },
    unreadCount: 1,
    isGroup: false,
  },
  {
    _id: "4",
    name: "Noah Wilson",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Did you see the latest project update?",
      createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    },
    unreadCount: 3,
    isGroup: false,
  },
  {
    _id: "5",
    name: "Sophia Martinez",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Let me know when you're free to talk",
      createdAt: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    },
    unreadCount: 0,
    isGroup: false,
  },
  {
    _id: "6",
    name: "William Anderson",
    image: faker.image.avatar(),
    lastMessage: {
      text: "I'll be there in 10 minutes",
      createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    },
    unreadCount: 0,
    isGroup: false,
  },
  {
    _id: "7",
    name: "Isabella Taylor",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Can you send me the address?",
      createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    },
    unreadCount: 5,
    isGroup: false,
  },
  {
    _id: "8",
    name: "James Thomas",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Great job on the presentation!",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    },
    unreadCount: 1,
    isGroup: false,
  },
  {
    _id: "9",
    name: "Charlotte Brown",
    image: faker.image.avatar(),
    lastMessage: {
      text: "I have a question about the new feature",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    },
    unreadCount: 0,
    isGroup: false,
  },
  {
    _id: "10",
    name: "Benjamin Garcia",
    image: faker.image.avatar(),
    lastMessage: {
      text: "Are you coming to the team lunch?",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    },
    unreadCount: 2,
    isGroup: false,
  },
];
