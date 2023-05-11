import Airtable from 'airtable';
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AddReviewForm from "../../components/ReviewForm/AddReviewForm"

const base = new Airtable({ apiKey: process.env.REACT_APP_AIRTABLE_API_KEY }).base(process.env.REACT_APP_AIRTABLE_BASE_ID);

const StylistProfile = () => {
    const { user, isLoading, isAuthenticated } = useAuth0();
    const { id } = useParams();
    const [stylist, setStylist] = useState(null);
    const [reviews, setReviews] = useState([]);

    const getStylist = async () => {
        try {
            const record = await base("stylists").find(id);
            setStylist(record);
        } catch (error) {
            console.error(error);
        }
    };

    const getReviews = async () => {
        try {
            const response = await base("reviews").select({ view: "Grid view" }).all();
            const filteredReviews = response.filter(record => {
                const stylistIds = record.get("Stylists") || [];
                return stylistIds.includes(id);
            });
            setReviews(filteredReviews.map(record => ({ id: record.id, ...record.fields })));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getReviews();
        getStylist();
    }, [id]);

    if (isLoading || !user) {
        return <div>Loading...</div>;
    }

    console.log(user.sub)
    return (
        <section>
            <h1>{stylist.fields.Name}</h1>
            <p>{stylist.fields.Bio}</p>
            <p>{stylist.fields.Contact}</p>
            <h2>Reviews</h2>
            <AddReviewForm stylistId={id} />
            {reviews.map((review) => (
                <div key={review.id}>
                    <p>Review ID: {review.id}</p>
                    <p>User: {review.Name}</p>
                    <p>Rating: {review.Rating}</p>
                    <p>Comment: {review.Comment}</p>
                    <p>Owner: {review.Owner}</p>
                    <p>User: {user.sub}</p>
                    {review.Owner === user.sub && (
                        <Link review={review} stylist={stylist} key={stylist.id} to={`/reviews/${review.id}/edit`}><button>Edit</button></Link>
                    )}
                </div>
            ))}
        </section>
    );
};

export default StylistProfile;
