import type { IndiaState } from "@/types/location";

export const INDIA_COUNTRY = {
  name: "India",
  flag: "🇮🇳",
  code: "IN",
} as const;

export const INDIAN_STATES: IndiaState[] = [
  { code: "AP", name: "Andhra Pradesh", type: "STATE", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"] },
  { code: "AR", name: "Arunachal Pradesh", type: "STATE", cities: ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro", "Bomdila", "Tezu", "Roing"] },
  { code: "AS", name: "Assam", type: "STATE", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj"] },
  { code: "BR", name: "Bihar", type: "STATE", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar"] },
  { code: "CT", name: "Chhattisgarh", type: "STATE", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh"] },
  { code: "GA", name: "Goa", type: "STATE", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem"] },
  { code: "GJ", name: "Gujarat", type: "STATE", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Nadiad"] },
  { code: "HR", name: "Haryana", type: "STATE", cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"] },
  { code: "HP", name: "Himachal Pradesh", type: "STATE", cities: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Una", "Bilaspur", "Chamba"] },
  { code: "JH", name: "Jharkhand", type: "STATE", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"] },
  { code: "KA", name: "Karnataka", type: "STATE", cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Shivamogga", "Tumakuru", "Udupi"] },
  { code: "KL", name: "Kerala", type: "STATE", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur", "Palakkad", "Kottayam", "Malappuram"] },
  { code: "MP", name: "Madhya Pradesh", type: "STATE", cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"] },
  { code: "MH", name: "Maharashtra", type: "STATE", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai"] },
  { code: "MN", name: "Manipur", type: "STATE", cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati"] },
  { code: "ML", name: "Meghalaya", type: "STATE", cities: ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Baghmara", "Nongpoh"] },
  { code: "MZ", name: "Mizoram", type: "STATE", cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Mamit"] },
  { code: "NL", name: "Nagaland", type: "STATE", cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Zunheboto"] },
  { code: "OD", name: "Odisha", type: "STATE", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"] },
  { code: "PB", name: "Punjab", type: "STATE", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga"] },
  { code: "RJ", name: "Rajasthan", type: "STATE", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar", "Bharatpur"] },
  { code: "SK", name: "Sikkim", type: "STATE", cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Singtam", "Jorethang"] },
  { code: "TN", name: "Tamil Nadu", type: "STATE", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Thanjavur"] },
  { code: "TG", name: "Telangana", type: "STATE", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda"] },
  { code: "TR", name: "Tripura", type: "STATE", cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Khowai", "Ambassa"] },
  { code: "UP", name: "Uttar Pradesh", type: "STATE", cities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Ghaziabad", "Noida", "Meerut", "Bareilly", "Aligarh"] },
  { code: "UK", name: "Uttarakhand", type: "STATE", cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh", "Nainital", "Kashipur"] },
  { code: "WB", name: "West Bengal", type: "STATE", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia"] },
  { code: "AN", name: "Andaman and Nicobar Islands", type: "UNION_TERRITORY", cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Car Nicobar", "Hut Bay"] },
  { code: "CH", name: "Chandigarh", type: "UNION_TERRITORY", cities: ["Chandigarh", "Manimajra"] },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", type: "UNION_TERRITORY", cities: ["Daman", "Diu", "Silvassa", "Amli", "Naroli"] },
  { code: "DL", name: "Delhi", type: "UNION_TERRITORY", cities: ["New Delhi", "Delhi", "Dwarka", "Rohini", "Karol Bagh", "Saket", "Lajpat Nagar", "Pitampura"] },
  { code: "JK", name: "Jammu and Kashmir", type: "UNION_TERRITORY", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore"] },
  { code: "LA", name: "Ladakh", type: "UNION_TERRITORY", cities: ["Leh", "Kargil", "Diskit", "Nubra", "Khalatse"] },
  { code: "LD", name: "Lakshadweep", type: "UNION_TERRITORY", cities: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni"] },
  { code: "PY", name: "Puducherry", type: "UNION_TERRITORY", cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai"] },
];

export function getIndiaStateByName(name: string | null | undefined) {
  const normalized = String(name || "").trim().toLowerCase();
  return INDIAN_STATES.find((state) => state.name.toLowerCase() === normalized) ?? null;
}

export function getCitiesForState(stateName: string | null | undefined) {
  return getIndiaStateByName(stateName)?.cities ?? [];
}

