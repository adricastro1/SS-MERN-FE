import 'rsuite/dist/rsuite-no-reset.min.css';
import './StylistProfile.css'
import { Loader, FlexboxGrid, Panel, Divider } from 'rsuite';
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Airtable from 'airtable';
import AddReviewForm from "../../components/ReviewForm/AddReviewForm"
import StylistReviews from '../../components/StylistReviews.js';

const base = new Airtable({ apiKey: process.env.REACT_APP_AIRTABLE_API_KEY }).base(process.env.REACT_APP_AIRTABLE_BASE_ID);

const StylistProfile = () => {
    const { isLoading } = useAuth0();
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

    if (isLoading || !stylist) {
        return (
            <div>
                <Loader backdrop content="loading..." vertical />
            </div>
        );
    }

    return (
        <section>
            {stylist && (
                <FlexboxGrid>
                    <FlexboxGrid.Item colspan={13} >
                        <h1 className='Name'>{stylist.fields.Name}</h1>
                        <img className='profile-img' src={`${stylist.fields.Image}`} alt="Profile-Banner" />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={10}>
                        <Panel shaded bordered className='Panel' header="title goes here">
                            <Divider />
                            <p>{stylist.fields.Bio}</p>
                            <p>{stylist.fields.Contact}</p>
                        </Panel>
                    </FlexboxGrid.Item>
                </FlexboxGrid>
            )}

            <FlexboxGrid className='Reviews'>
                <FlexboxGrid.Item colspan={12}>
                    <StylistReviews reviews={reviews}/>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={12}>
                    <AddReviewForm stylistId={id} />
                </FlexboxGrid.Item>
            </FlexboxGrid>
        </section>
    );
};

export default StylistProfile;
