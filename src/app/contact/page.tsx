"use client";

import { useState } from "react";
import Image from "next/image";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1e3a8a] dark:text-blue-300 text-center mb-16">İletişim</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Kart */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-md p-10">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 relative mb-6">
                <Image
                  src="/profile.jpg"
                  alt="Profil Fotoğrafı"
                  fill
                  className="rounded-full object-cover border-[6px] border-gray-50 shadow-lg"
                />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a8a] dark:text-blue-300 mb-2">Fatih Tanrıverdi</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-10">Yazılım Geliştirici</p>

              <div className="w-full space-y-8">
                <a 
                  href="mailto:f_tanriverdii@hotmail.com" 
                  className="flex items-center space-x-4 text-gray-600 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors group"
                >
                  <FaEnvelope className="text-xl text-[#1e3a8a] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>f_tanriverdii@hotmail.com</span>
                </a>
                
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-200">
                  <FaPhone className="text-xl text-[#1e3a8a] dark:text-blue-400" />
                  <span>+90 (539) 814 63 29</span>
                </div>
                
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-200">
                  <FaMapMarkerAlt className="text-xl text-[#1e3a8a] dark:text-blue-400" />
                  <span>İstanbul, Türkiye</span>
                </div>
              </div>

              <div className="w-full mt-10 pt-10 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-[#1e3a8a] dark:text-blue-300 mb-6">Sosyal Medya</h3>
                <div className="flex justify-start space-x-8">
                  <a 
                    href="https://www.linkedin.com/in/fatihtanrıverdii/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 dark:text-gray-300 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all hover:scale-110"
                  >
                    <FaLinkedin className="text-2xl" />
                  </a>
                  <a 
                    href="https://github.com/fatihtanriverdii" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-gray-400 dark:text-gray-300 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all hover:scale-110"
                  >
                    <FaGithub className="text-2xl" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kart - Harita */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-md p-10">
            <h2 className="text-2xl font-bold text-[#1e3a8a] dark:text-blue-300 mb-6">Konum</h2>
            <div className="w-full h-[500px] rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d385398.5897809314!2d28.731994399999998!3d41.0053215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa7040068086b%3A0xe1ccfe98bc01b0d0!2zxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1641234567890!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}