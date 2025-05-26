import { Suspense } from 'react'
import { EyeIcon, TrashIcon } from 'lucide-react'

// Mock data for the table
const mockResponses = [
  {
    id: 'cmb3vys5',
    form: 'Kleem AI careers',
    respondent: 'Anonymous',
    email: 'durgesh3@gmail.com',
    date: 'May 25, 2025, 10:11 PM',
  },
  {
    id: 'cmb3vih',
    form: 'Kleem AI careers',
    respondent: 'Anonymous',
    email: 'durgesh2@gmail.com',
    date: 'May 25, 2025, 09:59 PM',
  },
  {
    id: 'cmb3rdj3',
    form: 'Kleem AI careers',
    respondent: 'Anonymous',
    email: 'durgesh@gmail.com',
    date: 'May 25, 2025, 08:03 PM',
  },
]

const MockHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search responses..."
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-md w-full sm:w-auto"
        />
        <select className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm border rounded-md w-full sm:w-auto">
          <option value="">All Forms</option>
          <option value="careers">Kleem AI careers</option>
        </select>
      </div>
      <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-primary text-white rounded-md w-full sm:w-auto">
        Export
      </button>
    </div>
  )
}

const MockTable = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto -mx-2 sm:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Form
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Respondent
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Date
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {mockResponses.map((response) => (
            <tr key={response.id} className="hover:bg-gray-50">
              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs text-gray-900 truncate max-w-[100px] sm:max-w-none">
                {response.form}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs text-gray-500 hidden sm:table-cell">
                {response.respondent}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">
                {response.email}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-4 text-xs text-gray-500 hidden sm:table-cell">
                {response.date}
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-4 text-right space-x-1 sm:space-x-2">
                <button className="text-gray-400 hover:text-gray-500 p-1">
                  <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-500 p-1">
                  <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const MockResponsePage = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      <div className="flex flex-col space-y-0.5 sm:space-y-1">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
          Form Responses
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          View and manage all form submissions across your forms.
        </p>
      </div>

      <MockHeader />

      <Suspense fallback={<div className="text-xs sm:text-sm">Loading...</div>}>
        <MockTable />
      </Suspense>
    </div>
  )
}
