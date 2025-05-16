"use client";

import { FaRecycle, FaClock, FaRobot, FaDatabase } from "react-icons/fa6";
import { MdFace, MdSecurity, MdPhonelink } from "react-icons/md";
import { SiTensorflow, SiPython, SiReact, SiNextdotjs, SiDotnet, SiGooglecloud } from "react-icons/si";

export default function AboutPage() {
  const features = [
    {
      icon: <MdFace className="w-8 h-8 text-blue-600" />,
      title: "Yüz Analizi",
      description: "Gelişmiş yapay zeka ile yüz şeklinizi analiz ederek size en uygun gözlük modellerini öneriyoruz."
    },
    {
      icon: <MdPhonelink className="w-8 h-8 text-blue-600" />,
      title: "Sanal Deneme",
      description: "Artırılmış gerçeklik teknolojisi ile gözlükleri yüzünüzde görün."
    },
    {
      icon: <FaClock className="w-8 h-8 text-blue-600" />,
      title: "Zaman Tasarrufu",
      description: "Mağaza mağaza gezmeden, evinizin konforunda gözlük seçimi yapın."
    },
    {
      icon: <MdSecurity className="w-8 h-8 text-blue-600" />,
      title: "Güvenli Deneyim",
      description: "Hijyenik ve güvenli bir sanal deneme deneyimi yaşayın."
    },
    {
      icon: <FaRecycle className="w-8 h-8 text-blue-600" />,
      title: "Sürdürülebilirlik",
      description: "Çevre dostu ürünleri destekleyerek sürdürülebilir bir gelecek için çalışıyoruz."
    },
    {
      icon: <FaRobot className="w-8 h-8 text-blue-600" />,
      title: "Akıllı Teknoloji",
      description: "Yapay zeka ve görüntü işleme teknolojileri ile kişiselleştirilmiş öneriler."
    }
  ];

  const technologies = [
    { icon: <SiTensorflow className="w-16 h-16" />, name: "TensorFlow" },
    { icon: <SiPython className="w-16 h-16" />, name: "Python" },
    { icon: <SiReact className="w-16 h-16" />, name: "React" },
    { icon: <SiNextdotjs className="w-16 h-16" />, name: "Next.js" },
    { icon: <SiGooglecloud className="w-16 h-16" />, name: "Google Cloud" },
    { icon: <SiDotnet className="w-16 h-16" />, name: ".NET" },
    { icon: <FaDatabase className="w-16 h-16" />, name: "SQL Server" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Ana Tanıtım */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 mt-8">
        <h1 className="text-3xl font-bold text-[#1e3a8a] dark:text-blue-300 mb-4">Hakkımızda</h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
          Fatih Tanrıverdi olarak, teknoloji ile insan yaşamını daha konforlu hale getirmeyi amaçlayan yenilikçi projeler geliştiriyorum. "Yüz Şekline Göre Akıllı Gözlük Öneri Sistemi" projemle, alışveriş deneyimini kişiselleştiriyor ve herkesin yüz yapısına en uygun gözlük modellerine zahmetsizce ulaşmasını sağlıyorum.
        </p>
        <p className="text-gray-600 dark:text-gray-200 mb-4">
          Yapay zeka, yüz analizi ve artırılmış gerçeklik teknolojilerini bir araya getirerek kullanıcıların hijyenik, hızlı ve güvenilir bir sanal deneme ortamı yaşamalarına olanak sunuyorum. Aynı zamanda sürdürülebilir bir gelecek vizyonuyla, geri dönüştürülmüş ürünleri destekleyerek çevresel etkiyi azaltmayı hedefliyorum.
        </p>
        <p className="text-gray-600 dark:text-gray-200 mb-4">
          Bu proje, zaman tasarrufu sağlamak, alışveriş deneyimini iyileştirmek ve kullanıcıların özgüvenini artırmak amacıyla geliştirilmiştir. İnsana değer veren, teknolojiyi akıllıca kullanan ve sürdürülebilirliği önemseyen bir bakış açısıyla çalışmalarımı sürdürüyorum.
        </p>
        <p className="text-gray-600 dark:text-gray-400 italic">
          Doğru seçim, doğru teknolojiyle buluştuğunda gerçek fark yaratır.
        </p>
      </div>

      {/* Özellikler Grid */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center text-[#1e3a8a] dark:text-blue-300 mb-8">Öne Çıkan Özellikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{feature.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teknolojiler */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold text-center text-[#1e3a8a] dark:text-blue-300 mb-8">Kullanılan Teknolojiler</h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
          <div className="flex flex-wrap justify-center items-center gap-12">
            {technologies.map((tech, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="text-gray-600 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                  {tech.icon}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 