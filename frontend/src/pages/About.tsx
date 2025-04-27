import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Brain, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Users, 
  Sparkles 
} from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Cura</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Empowering Students through Growth-Centered Feedback
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Cura transforms educational feedback from rigid numerical scores into nurturing dialogues 
          that prioritize student growth, emotional well-being, and identity formation.
        </p>
      </div>

      {/* Why Cura? Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Why Cura?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* The Problem with Traditional Grading */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">The Problem with Traditional Grading</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Anxiety, depression, fear of failure</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Diminished intrinsic motivation and engagement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Academic stress and sleep deprivation</span>
              </li>
            </ul>
          </div>

          {/* Cura's Evidence-Based Solution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Cura's Evidence-Based Solution</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Formative feedback boosting intrinsic motivation, self-regulation, and learning outcomes
            </p>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Increased understanding, active engagement, self-regulated learning</span>
                  <span className="block text-xs mt-1">(Aligula 2024)</span>
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Improved self-efficacy & student-teacher relationships</span>
                  <span className="block text-xs mt-1">(Vedder 2018)</span>
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Enhanced motivation & self-reflection</span>
                  <span className="block text-xs mt-1">(Pan & Gan 2019)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Philosophical Modules */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 rounded-full p-3 mr-4">
                <Lightbulb className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">Weekly Philosophical Modules</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Prompts exploring identity and values</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Build critical thinking in low-stakes, collaborative settings</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>P4C-inspired approach to personal growth</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start">
            <Award className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reasoning Skills</h3>
              <p className="text-gray-700">Large gains in analytical ability</p>
            </div>
          </div>
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Comprehension & Cognitive Skills</h3>
              <p className="text-gray-700">Moderate improvements supporting all subjects</p>
            </div>
          </div>
          <div className="flex items-start">
            <Users className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Academic Outcomes</h3>
              <p className="text-gray-700">Noticeable boosts in science, reading, and listening comprehension</p>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Cura Unique Section */}
      <div className="bg-gray-100 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Makes Cura Unique?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Growth-Oriented Dialogue</h3>
            </div>
            <p className="text-gray-700">
              Shift from judgmental grades to growth-oriented dialogue that nurtures student development
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Philosophical Inquiry</h3>
            </div>
            <p className="text-gray-700">
              Integration of philosophical inquiry for personal and academic development
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Emotional Well-being</h3>
            </div>
            <p className="text-gray-700">
              Prioritization of emotional health and cognitive accessibility in all feedback
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link 
          to="/signup" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Get Started with Cura
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
} 