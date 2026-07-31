import type { IndiaState } from "@/types/location";

export const INDIA_COUNTRY = {
  name: "India",
  flag: "🇮🇳",
  code: "IN",
} as const;

export const INDIAN_STATES: IndiaState[] = [
  { code: "AP", name: "Andhra Pradesh", type: "STATE", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur", "Eluru", "Vizianagaram", "Ongole"] },
  { code: "AR", name: "Arunachal Pradesh", type: "STATE", cities: ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro", "Bomdila", "Tezu", "Roing", "Aalo"] },
  { code: "AS", name: "Assam", type: "STATE", cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Dhubri"] },
  { code: "BR", name: "Bihar", type: "STATE", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra"] },
  { code: "CT", name: "Chhattisgarh", type: "STATE", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur"] },
  { code: "GA", name: "Goa", type: "STATE", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Cuncolim"] },
  { code: "GJ", name: "Gujarat", type: "STATE", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Nadiad", "Morbi", "Bharuch"] },
  { code: "HR", name: "Haryana", type: "STATE", cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani"] },
  { code: "HP", name: "Himachal Pradesh", type: "STATE", cities: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Una", "Bilaspur", "Chamba", "Hamirpur", "Palampur"] },
  { code: "JH", name: "Jharkhand", type: "STATE", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Phusro"] },
  { code: "KA", name: "Karnataka", type: "STATE", cities: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Shivamogga", "Tumakuru", "Udupi", "Ballari", "Davangere"] },
  { code: "KL", name: "Kerala", type: "STATE", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur", "Palakkad", "Kottayam", "Malappuram", "Kasaragod"] },
  { code: "MP", name: "Madhya Pradesh", type: "STATE", cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli"] },
  { code: "MH", name: "Maharashtra", type: "STATE", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Chhatrapati Sambhajinagar", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai", "Pimpri-Chinchwad", "Kalyan-Dombivli", "Vasai-Virar", "Mira-Bhayandar", "Nanded", "Sangli"] },
  { code: "MN", name: "Manipur", type: "STATE", cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Jiribam"] },
  { code: "ML", name: "Meghalaya", type: "STATE", cities: ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Baghmara", "Nongpoh", "Resubelpara"] },
  { code: "MZ", name: "Mizoram", type: "STATE", cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Mamit", "Lawngtlai"] },
  { code: "NL", name: "Nagaland", type: "STATE", cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Zunheboto", "Phek"] },
  { code: "OD", name: "Odisha", type: "STATE", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"] },
  { code: "PB", name: "Punjab", type: "STATE", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar", "Phagwara"] },
  { code: "RJ", name: "Rajasthan", type: "STATE", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar", "Bharatpur", "Pali", "Sri Ganganagar"] },
  { code: "SK", name: "Sikkim", type: "STATE", cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Singtam", "Jorethang", "Ravangla"] },
  { code: "TN", name: "Tamil Nadu", type: "STATE", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Kanchipuram"] },
  { code: "TG", name: "Telangana", type: "STATE", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Suryapet", "Miryalaguda"] },
  { code: "TR", name: "Tripura", type: "STATE", cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Khowai", "Ambassa", "Bishalgarh"] },
  { code: "UP", name: "Uttar Pradesh", type: "STATE", cities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Ghaziabad", "Noida", "Greater Noida", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Mathura"] },
  { code: "UK", name: "Uttarakhand", type: "STATE", cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh", "Nainital", "Kashipur", "Ramnagar"] },
  { code: "WB", name: "West Bengal", type: "STATE", cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia", "Baharampur", "Habra"] },
  { code: "AN", name: "Andaman and Nicobar Islands", type: "UNION_TERRITORY", cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Car Nicobar", "Hut Bay"] },
  { code: "CH", name: "Chandigarh", type: "UNION_TERRITORY", cities: ["Chandigarh", "Manimajra"] },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", type: "UNION_TERRITORY", cities: ["Daman", "Diu", "Silvassa", "Amli", "Naroli"] },
  { code: "DL", name: "Delhi", type: "UNION_TERRITORY", cities: ["New Delhi", "Delhi", "Dwarka", "Rohini", "Karol Bagh", "Saket", "Lajpat Nagar", "Pitampura", "Vasant Kunj", "Connaught Place", "Janakpuri"] },
  { code: "JK", name: "Jammu and Kashmir", type: "UNION_TERRITORY", cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore", "Rajouri"] },
  { code: "LA", name: "Ladakh", type: "UNION_TERRITORY", cities: ["Leh", "Kargil", "Diskit", "Nubra", "Khalatse"] },
  { code: "LD", name: "Lakshadweep", type: "UNION_TERRITORY", cities: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni"] },
  { code: "PY", name: "Puducherry", type: "UNION_TERRITORY", cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai"] },
];

export function getIndiaStateByNameOrCode(query: string | null | undefined): IndiaState | null {
  if (!query) return null;
  const normalized = query.trim().toLowerCase();
  return (
    INDIAN_STATES.find(
      (state) =>
        state.name.toLowerCase() === normalized ||
        state.code.toLowerCase() === normalized ||
        state.name.toLowerCase().includes(normalized) ||
        normalized.includes(state.name.toLowerCase())
    ) ?? null
  );
}
