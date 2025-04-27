"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/profile.jpg"
          alt="Profil Fotoğrafı"
          width={140}
          height={180}
          className="rounded-full border-2 border-blue-200 shadow mb-3"
        />
        <span className="text-xl font-bold text-[#1e3a8a] mt-2">Fatih Tanrıverdi</span>
        <div className="flex gap-4 mt-2">
          <a href="mailto:f_tanriverdi@hotmail.com" className="text-blue-700 hover:underline font-semibold flex items-center gap-1" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm2 4v1a3 3 0 01-3 3H7a3 3 0 01-3-3v-1" /></svg>
            E-posta
          </a>
          <a href="https://www.linkedin.com/in/fatihtanrıverdii/" className="text-blue-700 hover:underline font-semibold flex items-center gap-1" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.04 0 3.602 2.002 3.602 4.604v5.592z"/></svg>
            LinkedIn
          </a>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-[#1e3a8a] mb-4">İletişim</h1>
      <p className="text-lg text-gray-700 mb-6">
        Bizimle iletişime geçmek için aşağıdaki formu doldurabilir veya doğrudan e-posta gönderebilirsiniz.
      </p>
      <div className="mb-6">
        <p className="text-gray-600">Email: info@glassify.com</p>
        <p className="text-gray-600">Tel: +90 (555) 123 45 67</p>
        <p className="text-gray-600">Adres: İstanbul, Türkiye</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-1" htmlFor="name">Adınız</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">E-posta</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1" htmlFor="message">Mesajınız</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#1e3a8a] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#2541a6] transition-colors"
        >
          Gönder
        </button>
        {submitted && (
          <div className="text-green-600 font-semibold mt-2">Mesajınız iletildi! Teşekkürler.</div>
        )}
      </form>
    </div>
  );
} 