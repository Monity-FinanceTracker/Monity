import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Spinner from './Spinner'

function ListExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');

    const handleDelete = index => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return

        fetch(`http://localhost:3000/delete-expense`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ index })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                setExpenses(prev => prev.filter((_, i) => i !== index))
            })
            .catch(error => {
                console.error(error)
                alert("Could not delete - please try again.")
            })
    }

    useEffect(() => {
        fetch('http://localhost:3000/list-expenses')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })

            .then(data => {
                setExpenses(data.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            })
    }, []);

    const filtered = expenses
        .filter(expense => (
            (category === '' ? true : expense.category.toLowerCase().includes(category.toLowerCase()))
        ))
        .filter(expense => (
            (date === '' ? true : expense.date.startsWith(date))
        ))

    let sum = 0
    filtered.forEach(expense => {
        sum += parseFloat(expense.amount)
    })
    if (!expenses.length) {
        return <p>No expenses found.</p>
    }
    if (loading) {
        return <Spinner message="Loading expenses..." />
    }
    if (error) {
        return <p>Error: {error}</p>
    }

    return (
        <div className="bg-[#191E29] border-1 p-4 rounded shadow-lg shadow-red-400 ring-2 ring-red-400/50 ">
            <div className='flex items-center justify-between gap-10'>
                <h3>Total Expenses: ${sum.toFixed(2)}</h3>
                <div>
                    <label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="e.g. Food" /></label>
                    <label><input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="DD/MM/YY" /></label>
                </div>

                <Link
                    to="/add-expense"
                    className="inline-block text-white hover:text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br shadow-lg shadow-red-500/50 dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 focus:outline-none focus:ring-0 focus:shadow-none">
                    Add Expense
                </Link>


            </div>
            <ul >
                {filtered.map((expense, index) => (
                    <li key={index} className="odd:bg-[#191E25] p-4 rounded shadow flex justify-between items-center">
                        <span>
                            {expense.category} - ${expense.amount} ({expense.description}) on {expense.date}
                        </span>
                        <button onClick={() => handleDelete(index)}>🗑️</button>
                    </li>
                ))}
            </ul>
        </div>
    )
};

export default ListExpenses;