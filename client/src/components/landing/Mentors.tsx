import { motion } from "framer-motion";
import mentor1 from "@assets/generated_images/portrait_of_a_senior_male_public_speaker_mentor..png";
import mentor2 from "@assets/generated_images/portrait_of_a_female_business_communication_coach..png";
import { Linkedin, Instagram } from "lucide-react";

const mentors = [
  {
    name: "Aziz Rahimov",
    role: "Bosh Mentor",
    bio: "20+ yil tajribaga ega notiq. Xalqaro konferensiyalar spikeri. 5000+ o‘quvchilarni o‘qitgan.",
    image: mentor1 
  },
  {
    name: "Malika Karimova",
    role: "Biznes Trener",
    bio: "Psixologiya fanlari nomzodi. Katta kompaniyalar rahbarlari uchun shaxsiy konsultant.",
    image: mentor2
  }
];

export default function Mentors() {
  return (
    <section id="mentors" className="py-24 bg-white dark:bg-navy-950">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 dark:text-white mb-4">
            Tajribali <span className="text-gold-600">Mentorlar</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Sizga o‘z sohasining eng kuchli mutaxassislari ustozlik qiladi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {mentors.map((mentor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] md:aspect-[4/5]"
            >
              <img 
                src={mentor.image} 
                alt={mentor.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-gold-500 font-medium mb-1">{mentor.role}</p>
                  <h3 className="text-3xl font-serif font-bold text-white mb-3">{mentor.name}</h3>
                  <p className="text-gray-300 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {mentor.bio}
                  </p>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    <button className="text-white hover:text-gold-500 transition-colors"><Linkedin /></button>
                    <button className="text-white hover:text-gold-500 transition-colors"><Instagram /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
