import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teacher } from '../../services/api';
import { format } from 'date-fns';

interface Submission {
  id: string;
  documentName: string;
  studentName: string;
  created_at: string;   // ← matches your backend JSON
}

export default function ViewSubmissions() {
  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ['teacher-submissions'],
    queryFn: teacher.getAllSubmissions,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h1>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{submission.documentName}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted by {submission.studentName} on{' '}
                    {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Link
                    to={`/teacher/submissions/${submission.id}/feedback`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate Feedback
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No submissions yet</p>
        </div>
      )}
    </div>
  );
}
