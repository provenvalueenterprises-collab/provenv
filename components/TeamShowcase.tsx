import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  email?: string;
}

const TeamShowcase = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Mrs. Onu Blessing Rita - AKA Blessed Rita - The Value Adder",
      role: "CEO & Founder",
      bio: "A visionary entrepreneur and community development expert with over a decade of experience in wealth building and cooperative societies. As the driving force behind ProvenValue, she pioneered innovative thrift solutions that have empowered thousands of Nigerians to build generational wealth through disciplined savings and collective community strategies.",
      image: "blessed-rita.jpg",
      linkedin: "#",
      email: "blessedrita@provenvalue.com"
    },
    {
      name: "Mr. Onu Obinna Emmanuel",
      role: "Manager/Administrator",
      bio: "A dedicated manager who oversees the day-to-day operations of ProvenValue Enterprise. With strong leadership and organizational skills, he ensures smooth business operations, coordinates team activities, and maintains efficient administrative processes that support our mission of democratizing wealth building for Nigerians.",
      image: "obinna-emmanuel.jpg",
      linkedin: "#",
      email: "obinnaemmanuel@provenvalue.com"
    },
    {
      name: "Mrs. Treasure Aondoyila",
      role: "Secretary",
      bio: "An operations excellence specialist who orchestrates the seamless execution of ProvenValue's thrift collection systems and member services. Her meticulous attention to detail and process optimization ensures that every member's contribution is accurately recorded and every withdrawal is processed with precision, maintaining the trust that defines our community.",
      image: "treasure-aondoyila.jpg",
      linkedin: "#",
      email: "treasureaondoyila@provenvalue.com"
    },
    {
      name: "Dr. Honest I Ameh",
      role: "Senior Adviser",
      bio: "A distinguished financial strategist and trusted advisor who guides ProvenValue's strategic direction and member financial education initiatives. His deep understanding of economic trends and wealth-building principles helps members navigate complex financial landscapes, ensuring they make informed decisions that align with their long-term prosperity goals.",
      image: "honest-ameh.jpg",
      linkedin: "#",
      email: "honestameh@provenvalue.com"
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Meet Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Expert Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            A diverse group of financial experts, technologists, and innovators committed to revolutionizing savings culture in Nigeria
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Profile Image */}
              <div className="relative flex justify-center pt-6 pb-2">
                <div className="relative w-56 h-56 overflow-hidden rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 shadow-lg">
                  <Image
                    src={`/images/team/${member.image}`}
                    alt={member.name}
                    width={224}
                    height={224}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Fallback initials */}
                  <div className="fallback absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full">
                    <span className="text-4xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex space-x-4 pt-4 border-t border-gray-100">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Send Email"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Core Values</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">T</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Trust & Transparency</h4>
              <p className="text-gray-600 text-sm">Building trust through complete transparency in our operations and financial practices.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">I</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600 text-sm">Continuously innovating to provide the best financial solutions for our users.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">E</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Excellence</h4>
              <p className="text-gray-600 text-sm">Committed to delivering excellence in every aspect of our service and support.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamShowcase;
