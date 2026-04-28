
import { BlogPost, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'gis-basic', name: 'GIS Cơ Bản & Nâng Cao' },
  { id: 'earth-obs', name: 'Quan Sát Trái Đất' },
  { id: 'solar-system', name: 'Hệ Mặt Trời' },
  { id: 'space-tech', name: 'Công Nghệ Vũ Trụ' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'GIS là gì? Tại sao GIS cần thiết cho nghiên cứu vũ trụ?',
    excerpt: 'Khám phá định nghĩa về GIS và sự chuyển dịch từ bản đồ 2D trên mặt đất sang hệ tọa độ không gian 3D phức tạp.',
    content: `
      <p class="mb-4">Hệ thống thông tin địa lý (GIS) không chỉ giới hạn ở việc vẽ bản đồ đường đi trên Google Maps. Trong kỷ nguyên không gian mới (New Space Age), GIS đóng vai trò cốt lõi trong việc quản lý dữ liệu vị trí của hàng triệu thiên thể.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Từ Geoid đến Ellipsoid</h3>
      <p class="mb-4">Trên Trái Đất, chúng ta sử dụng Geoid để mô phỏng mực nước biển. Nhưng trên Mặt Trăng hay Sao Hỏa, không có biển để làm chuẩn. Các nhà khoa học phải xây dựng các bề mặt tham chiếu (Reference Surfaces) hoàn toàn mới dựa trên trường trọng lực và dữ liệu đo cao từ vệ tinh (Altimetry).</p>

      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">GIS Đa Hành Tinh</h3>
      <p class="mb-4">NASA và ESA sử dụng các phần mềm GIS chuyên dụng để lập bản đồ bề mặt các hành tinh. Ví dụ, để hạ cánh tàu Perseverance lên miệng núi lửa Jezero, các kỹ sư đã phải xây dựng một bản đồ độ dốc (Slope Map) và độ gồ ghề (Roughness Map) cực kỳ chi tiết từ dữ liệu HiRISE.</p>
      
      <p>Kết luận, GIS trong vũ trụ không chỉ là công cụ, nó là ngôn ngữ để chúng ta hiểu vị trí của mình giữa các vì sao.</p>
    `,
    author: 'Dr. Orion Nguyen',
    date: '2023-10-15',
    category: 'gis-basic',
    tags: ['GIS', 'Introduction', 'Space Science'],
    imageUrl: 'https://picsum.photos/800/400?random=1',
    readTime: '5 phút'
  },
  {
    id: '2',
    title: 'Khám phá Sao Hỏa: Ứng dụng bản đồ không gian tìm sự sống',
    excerpt: 'Làm thế nào dữ liệu quang phổ và bản đồ địa hình giúp chúng ta xác định dấu vết của nước cổ đại trên Hành tinh Đỏ.',
    content: `
      <p class="mb-4">Sao Hỏa là mục tiêu lớn nhất của loài người trong thế kỷ 21. Nhưng trước khi con người đặt chân đến đó, GIS đã "đến" trước.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Phân tích Quang phổ (Spectral Analysis)</h3>
      <p class="mb-4">Sử dụng dữ liệu từ máy quang phổ CRISM trên tàu MRO, các nhà khoa học GIS đã lập bản đồ phân bố khoáng chất. Các lớp đất sét (Phyllosilicates) và muối (Carbonates) được định vị chính xác, cho thấy nơi đây từng có nước lỏng.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Lựa chọn bãi đáp (Landing Site Selection)</h3>
      <p class="mb-4">Quy trình chọn bãi đáp là một bài toán GIS điển hình: Chồng lớp (Overlay) các lớp dữ liệu về độ cao (DEM), độ dốc, mật độ đá và độ thú vị về mặt khoa học. Chỉ những vùng thỏa mãn tất cả tiêu chí mới được chọn.</p>
    `,
    author: 'Sarah Nova',
    date: '2023-10-20',
    category: 'solar-system',
    tags: ['Mars', 'Rover', 'Mapping'],
    imageUrl: 'https://picsum.photos/800/400?random=2',
    readTime: '7 phút'
  },
  {
    id: '3',
    title: 'So sánh Hệ quy chiếu Trái Đất và Bản đồ Thiên văn',
    excerpt: 'Sự khác biệt cơ bản giữa Latitude/Longitude trên Trái Đất và Right Ascension/Declination trên bầu trời.',
    content: `
      <p class="mb-4">Khi nhìn lên bầu trời, các quy tắc của bản đồ học truyền thống thay đổi hoàn toàn. Chúng ta không còn dùng vĩ độ/kinh độ theo nghĩa đen nữa.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Hệ tọa độ Xích đạo (Equatorial Coordinate System)</h3>
      <p class="mb-4">Trong thiên văn học, chúng ta dùng Góc giờ (Right Ascension - RA) và Độ xích vĩ (Declination - Dec). Đây là sự mở rộng của kinh vĩ độ Trái Đất ra quả cầu thiên thể (Celestial Sphere).</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Thách thức về Thời gian</h3>
      <p class="mb-4">Trái Đất quay, các ngôi sao có vẻ đứng yên nhưng thực ra chúng có chuyển động riêng (Proper Motion). Bản đồ vũ trụ là bản đồ 4D, nơi thời gian (Epoch) đóng vai trò quan trọng để xác định vị trí chính xác của một ngôi sao tại thời điểm quan sát.</p>
    `,
    author: 'Prof. Stardust',
    date: '2023-11-01',
    category: 'gis-basic',
    tags: ['Coordinate Systems', 'Astronomy', 'Math'],
    imageUrl: 'https://picsum.photos/800/400?random=3',
    readTime: '6 phút'
  },
  {
    id: '4',
    title: 'Vệ tinh Viễn thám: Mắt thần thu thập dữ liệu không gian',
    excerpt: 'Từ Landsat đến Sentinel - Cách các cảm biến thu thập dữ liệu đa phổ để phân tích sức khỏe hành tinh.',
    content: `
      <p class="mb-4">Viễn thám (Remote Sensing) là xương sống của GIS hiện đại. Không cần chạm vào đối tượng, chúng ta vẫn hiểu rõ về nó nhờ sóng điện từ.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Cảm biến thụ động và chủ động</h3>
      <p class="mb-4">Vệ tinh quang học (như Landsat 9) là thụ động, dựa vào ánh sáng mặt trời. Vệ tinh Radar (như Sentinel-1) là chủ động, tự phát sóng và thu hồi tín hiệu phản xạ, cho phép nhìn xuyên mây và đêm tối.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Chỉ số thực vật NDVI</h3>
      <p class="mb-4">Một trong những ứng dụng phổ biến nhất: Tính toán sức khỏe thảm thực vật từ vũ trụ bằng cách so sánh dải sóng Đỏ (Red) và Cận hồng ngoại (NIR).</p>
    `,
    author: 'Eng. Cosmo',
    date: '2023-11-05',
    category: 'earth-obs',
    tags: ['Remote Sensing', 'Satellite', 'Data'],
    imageUrl: 'https://picsum.photos/800/400?random=4',
    readTime: '5 phút'
  },
  {
    id: '5',
    title: 'Tương lai của GIS trong kỷ nguyên du hành liên sao',
    excerpt: 'Khi con người rời khỏi Hệ Mặt Trời, bản đồ sẽ trông như thế nào? AI và Deep Learning sẽ thay đổi cách lập bản đồ ra sao?',
    content: `
      <p class="mb-4">Chúng ta đang đứng trước ngưỡng cửa của việc trở thành giống loài đa hành tinh. GIS sẽ tiến hóa như thế nào?</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Bản đồ tự hành thời gian thực</h3>
      <p class="mb-4">Tàu vũ trụ tương lai sẽ không thể chờ lệnh từ Trái Đất (do độ trễ tín hiệu). Hệ thống GIS tích hợp AI trên tàu sẽ phải tự động lập bản đồ địa hình (SLAM) và ra quyết định điều hướng trong mili giây.</p>
      
      <h3 class="text-xl font-bold text-sky-600 dark:text-space-neon mb-2">Dữ liệu lớn không gian (Spatial Big Data)</h3>
      <p class="mb-4">Với hàng nghìn vệ tinh vệ tinh Starlink và các chòm sao vệ tinh quan sát Trái Đất, việc xử lý hàng Petabyte dữ liệu mỗi ngày đòi hỏi các thuật toán Cloud GIS và Deep Learning tiên tiến nhất.</p>
    `,
    author: 'Dr. Orion Nguyen',
    date: '2023-11-12',
    category: 'space-tech',
    tags: ['Future', 'AI', 'Interstellar'],
    imageUrl: 'https://picsum.photos/800/400?random=5',
    readTime: '8 phút'
  }
];

export const DEFAULT_ABOUT_CONTENT = `
<div class="text-center mb-16">
  <h1 class="text-4xl md:text-6xl font-display font-bold mb-6">
    Về <span class="text-sky-600 dark:text-space-neon">CosmoGIS</span>
  </h1>
  <p class="text-xl max-w-3xl mx-auto leading-relaxed">
    Chúng tôi là những nhà khoa học dữ liệu, kỹ sư bản đồ và những người yêu thiên văn, cùng nhau xây dựng cầu nối giữa Trái Đất và Vũ Trụ thông qua ngôn ngữ của bản đồ.
  </p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
  <div class="order-2 md:order-1">
    <h2 class="text-3xl font-display font-bold mb-4">Sứ Mệnh</h2>
    <div class="w-16 h-1 bg-purple-500 dark:bg-space-purple mb-6"></div>
    <p class="mb-4 leading-relaxed">
      Vũ trụ quá rộng lớn để có thể hiểu hết chỉ bằng quan sát thông thường. Chúng tôi tin rằng <strong>Spatial Data (Dữ liệu không gian)</strong> chính là chìa khóa.
    </p>
    <p class="leading-relaxed">
      Sứ mệnh của CosmoGIS là phổ cập kiến thức về GIS trong thiên văn học, cung cấp cái nhìn sâu sắc về cách các tàu vũ trụ định vị, cách chúng ta vẽ bản đồ Sao Hỏa, và cách công nghệ viễn thám bảo vệ Trái Đất.
    </p>
  </div>
  <div class="order-1 md:order-2 bg-gradient-to-br from-sky-500/20 to-purple-500/20 dark:from-space-neon/20 dark:to-space-purple/20 p-1 rounded-2xl">
    <div class="bg-white/80 dark:bg-space-900 rounded-xl p-8 h-full flex flex-col items-center justify-center text-center border border-slate-200 dark:border-white/10 shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-600 dark:text-space-neon mb-4 animate-pulse-slow"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      <h3 class="text-xl font-bold">Định vị Chính xác</h3>
      <p class="text-slate-500 dark:text-gray-500 mt-2">Dù ở bất cứ đâu trong dải Ngân Hà</p>
    </div>
  </div>
</div>
`;

export const DEFAULT_CONTACT_CONTENT = `
<h3 class="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
<div class="space-y-6">
  <div class="flex items-start">
    <div class="bg-sky-100 dark:bg-space-neon/10 p-3 rounded-full mr-4 text-sky-600 dark:text-space-neon">
       📍
    </div>
    <div>
      <h4 class="font-semibold">Trụ sở chính</h4>
      <p class="text-slate-600 dark:text-gray-400 mt-1">Tầng 12, Tòa nhà SpaceHub, Khu Công Nghệ Cao, TP.HCM</p>
    </div>
  </div>
  <div class="flex items-start">
    <div class="bg-purple-100 dark:bg-space-purple/10 p-3 rounded-full mr-4 text-purple-600 dark:text-space-purple">
       ✉️
    </div>
    <div>
      <h4 class="font-semibold">Email</h4>
      <p class="text-slate-600 dark:text-gray-400 mt-1">contact@cosmogis.space</p>
      <p class="text-slate-600 dark:text-gray-400">research@cosmogis.space</p>
    </div>
  </div>
  <div class="flex items-start">
    <div class="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-full mr-4 text-blue-600 dark:text-blue-400">
       📞
    </div>
    <div>
      <h4 class="font-semibold">Điện thoại</h4>
      <p class="text-slate-600 dark:text-gray-400 mt-1">(+84) 999-COSMOS</p>
    </div>
  </div>
</div>
`;
